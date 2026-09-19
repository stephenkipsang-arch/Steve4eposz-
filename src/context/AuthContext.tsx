import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { CURRENT_USER, ACADEMY_USERS } from '../data/mockData';
import { getStoredItem, setStoredItem } from '../utils/safeStorage';
import { apiFetch } from '../utils/api';

interface AuthContextType {
  currentUser: User;
  allAcademyUsers: User[];
  isAuthenticated: boolean;
  loginWithAcademyEmail: (email: string, password: string, name?: string) => Promise<{ success: boolean; message: string }>;
  switchUser: (userId: string) => void;
  updateProfile: (updatedFields: Partial<User>) => void;
  logout: () => void;
  isDomainValid: (email: string) => boolean;
  
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const LOCAL_STORAGE_USER_KEY = 'mfa_vexpex_current_user_v4';
const LOCAL_STORAGE_ALL_USERS_KEY = 'mfa_vexpex_all_users_v4';
const LOCAL_STORAGE_AUTH_KEY = 'mfa_vexpex_authenticated_v1';

const normalizeGrade10User = (user: User): User => ({
  ...user,
  role: 'Student - Grade 10',
  gradeOrDept: 'Grade 10',
  graduationYear: '2028',
  bio: user.bio && user.bio.includes('IB') ? 'Grade 10 learner | M-PESA Foundation Academy' : user.bio,
  house: 'Kenya'
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [allAcademyUsers, setAllAcademyUsers] = useState<User[]>(() => getStoredItem<User[]>(LOCAL_STORAGE_ALL_USERS_KEY, []));
  const [currentUser, setCurrentUser] = useState<User>(() => normalizeGrade10User(getStoredItem<User>(LOCAL_STORAGE_USER_KEY, CURRENT_USER)));

  useEffect(() => setStoredItem(LOCAL_STORAGE_USER_KEY, currentUser), [currentUser]);
  useEffect(() => setStoredItem(LOCAL_STORAGE_ALL_USERS_KEY, allAcademyUsers), [allAcademyUsers]);
  useEffect(() => setStoredItem(LOCAL_STORAGE_AUTH_KEY, isAuthenticated), [isAuthenticated]);

  // Shared directory sync. GET is independent from profile publishing, so a failed write
  // can never prevent friends from appearing in the directory.
  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    const syncUsers = async () => {
      try {
        const response = await apiFetch('/api/users');
        if (!response.ok) return;
        const data = await response.json();
        if (!active || !Array.isArray(data.users)) return;
        setAllAcademyUsers(data.users.map((u: User) => normalizeGrade10User(u)));
      } catch {
        // Keep the last known directory if the server is temporarily unavailable.
      }
    };
    void syncUsers();
    const timer = window.setInterval(() => void syncUsers(), 5000);
    return () => { active = false; window.clearInterval(timer); };
  }, [isAuthenticated, currentUser.id]);

  // Validate the server-side session on every app load. Local storage alone is never
  // sufficient to authenticate an account.
  useEffect(() => {
    let active = true;
    const restoreSession = async () => {
      try {
        const response = await apiFetch('/api/auth/me');
        if (!response.ok) {
          if (active) setIsAuthenticated(false);
          return;
        }
        const data = await response.json();
        if (!active || !data?.user) return;
        const canonical = normalizeGrade10User(data.user);
        setCurrentUser(canonical);
        setAllAcademyUsers((prev) => {
          const map = new Map(prev.map((u) => [u.id, u]));
          map.set(canonical.id, canonical);
          return Array.from(map.values());
        });
        setIsAuthenticated(true);
      } catch {
        if (active) setIsAuthenticated(false);
      }
    };
    void restoreSession();
    return () => { active = false; };
  }, []);

  // Publish presence only through the authenticated session.
  useEffect(() => {
    if (!isAuthenticated) return;
    const setPresence = (online: boolean) => {
      void apiFetch(`/api/users/${encodeURIComponent(currentUser.id)}/presence`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ online })
      }).catch(() => undefined);
    };
    setPresence(true);
    const heartbeat = window.setInterval(() => setPresence(true), 15000);
    const handleVisibility = () => setPresence(document.visibilityState === 'visible');
    const handleBeforeUnload = () => setPresence(false);
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.clearInterval(heartbeat);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      setPresence(false);
    };
  }, [currentUser.id, isAuthenticated]);

  const isDomainValid = (email: string): boolean => email.trim().toLowerCase().endsWith('@mpesafoundationacademy.ac.ke');

  const loginWithAcademyEmail = async (
    email: string,
    password: string,
    name?: string
  ): Promise<{ success: boolean; message: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!isDomainValid(cleanEmail)) {
      return { success: false, message: 'Access denied: use your M-PESA Foundation Academy email address.' };
    }
    if (password.length < 12) {
      return { success: false, message: 'Password must be at least 12 characters.' };
    }

    try {
      const userName = name || cleanEmail.split('@')[0].replace('.', ' ').replace(/\\b\\w/g, (l) => l.toUpperCase());
      const newUser: User = normalizeGrade10User({
        id: `user_${Date.now()}`,
        name: userName,
        email: cleanEmail,
        avatar: '/Steve4eposz-/mfa-default-avatar.jpg',
        coverImage: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80',
        role: 'Student - Grade 10', house: 'Kenya', graduationYear: '2028', gradeOrDept: 'Grade 10',
        bio: 'Grade 10 learner | M-PESA Foundation Academy', location: 'Thika Campus, Kenya',
        isVerifiedAcademy: true, friendsCount: 0, joinedDate: 'August 2026', clubs: []
      });

      // Try account creation first. An existing email returns 409, after which we
      // perform a real password login. This avoids a passwordless account-claim path.
      const register = await apiFetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newUser, password })
      });
      const registerData = await register.json().catch(() => ({}));
      if (register.ok && registerData?.user) {
        const canonicalUser = normalizeGrade10User(registerData.user);
        setCurrentUser(canonicalUser);
        setAllAcademyUsers((prev) => [...prev.filter((u) => u.email.toLowerCase() !== cleanEmail), canonicalUser]);
        setIsAuthenticated(true);
        return { success: true, message: `Account created for ${canonicalUser.name}.` };
      }
      if (register.status !== 409) {
        return { success: false, message: registerData?.error || 'Could not create the Academy account.' };
      }

      const response = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.user) {
        return { success: false, message: data?.error || 'Invalid Academy email or password.' };
      }

      const canonicalUser = normalizeGrade10User(data.user);
      setCurrentUser(canonicalUser);
      setAllAcademyUsers((prev) => {
        const map = new Map(prev.filter((u) => u.email.toLowerCase() !== cleanEmail).map((u) => [u.id, u]));
        map.set(canonicalUser.id, canonicalUser);
        return Array.from(map.values());
      });
      setIsAuthenticated(true);
      return { success: true, message: `Welcome back, ${canonicalUser.name}!` };
    } catch {
      return { success: false, message: 'Could not reach the MFA-VEXPEX account server. Please try again.' };
    }
  };

  const switchUser = (userId: string) => {
    const found = allAcademyUsers.find((u) => u.id === userId);
    if (found) setCurrentUser(found);
  };

  const updateProfile = (updatedFields: Partial<User>) => {
    setCurrentUser((prev) => {
      const updated = { ...prev, ...updatedFields };
      setAllAcademyUsers((all) => all.map((u) => (u.id === prev.id ? updated : u)));
      void apiFetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      }).catch(() => undefined);
      return updated;
    });
  };

  const logout = () => {
    void apiFetch('/api/auth/logout', { method: 'POST' }).catch(() => undefined);
    setIsAuthenticated(false);
    setCurrentUser(normalizeGrade10User(CURRENT_USER));
  };

  return (
    <AuthContext.Provider value={{ currentUser, allAcademyUsers, isAuthenticated, loginWithAcademyEmail, switchUser, updateProfile, logout, isDomainValid }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

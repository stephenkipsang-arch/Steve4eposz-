import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { CURRENT_USER, ACADEMY_USERS } from '../data/mockData';
import { getStoredItem, setStoredItem } from '../utils/safeStorage';
import { apiFetch } from '../utils/api';

interface AuthContextType {
  currentUser: User;
  allAcademyUsers: User[];
  isAuthenticated: boolean;
  loginWithAcademyEmail: (email: string, name?: string) => Promise<{ success: boolean; message: string }>;
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => getStoredItem<boolean>(LOCAL_STORAGE_AUTH_KEY, false));
  const [allAcademyUsers, setAllAcademyUsers] = useState<User[]>(() => getStoredItem<User[]>(LOCAL_STORAGE_ALL_USERS_KEY, []));
  const [currentUser, setCurrentUser] = useState<User>(() => normalizeGrade10User(getStoredItem<User>(LOCAL_STORAGE_USER_KEY, CURRENT_USER)));

  useEffect(() => setStoredItem(LOCAL_STORAGE_USER_KEY, currentUser), [currentUser]);
  useEffect(() => setStoredItem(LOCAL_STORAGE_ALL_USERS_KEY, allAcademyUsers), [allAcademyUsers]);
  useEffect(() => setStoredItem(LOCAL_STORAGE_AUTH_KEY, isAuthenticated), [isAuthenticated]);

  // Shared directory sync. The app keeps cached users if the backend is temporarily unavailable.
  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    const syncUsers = async () => {
      try {
        await apiFetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(normalizeGrade10User(currentUser))
        });

        const response = await apiFetch('/api/users');
        if (!response.ok) return;
        const data = await response.json();
        if (!active || !Array.isArray(data.users)) return;

        setAllAcademyUsers((local) => {
          const merged = new Map(local.map((u) => [u.id, u]));
          data.users.forEach((u: User) => {
            const normalized = normalizeGrade10User(u);
            merged.set(normalized.id, { ...merged.get(normalized.id), ...normalized });
          });
          const current = normalizeGrade10User(currentUser);
          merged.set(current.id, { ...merged.get(current.id), ...current });
          return Array.from(merged.values());
        });
      } catch {
        // Cached users remain available offline.
      }
    };
    void syncUsers();
    const timer = window.setInterval(() => void syncUsers(), 5000);
    return () => { active = false; window.clearInterval(timer); };
  }, [isAuthenticated, currentUser.id]);

  // Publish presence so other devices can see active students.
  useEffect(() => {
    if (!isAuthenticated) return;
    const setPresence = (online: boolean) => {
      void apiFetch(`/api/users/${encodeURIComponent(currentUser.id)}/presence`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ online })
      }).catch(() => undefined);
    };

    void apiFetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentUser)
    }).catch(() => undefined);

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
    name?: string
  ): Promise<{ success: boolean; message: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!isDomainValid(cleanEmail)) {
      return { success: false, message: 'Access Denied: MFA-VEXPEX is strictly restricted to M-PESA Foundation Academy email addresses.' };
    }

    try {
      const response = await apiFetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        const serverUsers = Array.isArray(data?.users) ? data.users : [];
        const existingOnServer = serverUsers.find(
          (u: User) => String(u.email || '').trim().toLowerCase() === cleanEmail
        );
        if (existingOnServer) {
          const canonicalUser = normalizeGrade10User(existingOnServer);
          setAllAcademyUsers((local) => {
            const cleaned = local.filter(
              (u) => String(u.email || '').trim().toLowerCase() !== cleanEmail || u.id === canonicalUser.id
            );
            const merged = new Map(cleaned.map((u) => [u.id, u]));
            merged.set(canonicalUser.id, { ...merged.get(canonicalUser.id), ...canonicalUser });
            return Array.from(merged.values());
          });
          setCurrentUser(canonicalUser);
          setIsAuthenticated(true);
          return { success: true, message: `Welcome back, ${canonicalUser.name}!` };
        }
      }
    } catch {
      // Use local cache only if the shared account service is temporarily unavailable.
    }

    const existing = allAcademyUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      const canonicalUser = normalizeGrade10User(existing);
      setCurrentUser(canonicalUser);
      setIsAuthenticated(true);
      return { success: true, message: `Welcome back, ${canonicalUser.name}!` };
    }

    const userName = name || cleanEmail.split('@')[0].replace('.', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    const newUser: User = {
      id: `user_${Date.now()}`,
      name: userName,
      email: cleanEmail,
      avatar: '/Steve4eposz-/mfa-default-avatar.jpg',
      coverImage: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80',
      role: 'Student - Grade 10',
      house: 'Kenya',
      graduationYear: '2028',
      gradeOrDept: 'Grade 10',
      bio: 'Grade 10 learner | M-PESA Foundation Academy',
      location: 'Thika Campus, Kenya',
      isVerifiedAcademy: true,
      friendsCount: 0,
      joinedDate: 'August 2026',
      clubs: []
    };

    const normalizedNewUser = normalizeGrade10User(newUser);
    try {
      const registerResponse = await apiFetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(normalizedNewUser)
      });
      if (registerResponse.ok) {
        const registerData = await registerResponse.json();
        const canonicalUser = normalizeGrade10User(registerData?.user || normalizedNewUser);
        setAllAcademyUsers((prev) => {
          const cleaned = prev.filter(
            (u) => String(u.email || '').trim().toLowerCase() !== cleanEmail || u.id === canonicalUser.id
          );
          const merged = new Map(cleaned.map((u) => [u.id, u]));
          merged.set(canonicalUser.id, canonicalUser);
          return Array.from(merged.values());
        });
        setCurrentUser(canonicalUser);
        setIsAuthenticated(true);
        return { success: true, message: `Account created for ${userName}! Verified with M-PESA Foundation Academy.` };
      }
    } catch {
      // Local fallback for a temporary backend outage.
    }

    setAllAcademyUsers((prev) => [...prev, normalizedNewUser]);
    setCurrentUser(normalizedNewUser);
    setIsAuthenticated(true);
    return { success: true, message: `Account created for ${userName}! Verified with M-PESA Foundation Academy.` };
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

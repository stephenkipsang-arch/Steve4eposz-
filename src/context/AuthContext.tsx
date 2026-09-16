import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, House, UserRole } from '../types';
import { CURRENT_USER, ACADEMY_USERS } from '../data/mockData';
import { getStoredItem, setStoredItem } from '../utils/safeStorage';

interface AuthContextType {
  currentUser: User;
  allAcademyUsers: User[];
  loginWithAcademyEmail: (email: string, name?: string, house?: House, role?: UserRole) => { success: boolean; message: string };
  switchUser: (userId: string) => void;
  updateProfile: (updatedFields: Partial<User>) => void;
  logout: () => void;
  isDomainValid: (email: string) => boolean;
  activeHouse: House;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const LOCAL_STORAGE_USER_KEY = 'mfa_vexpex_current_user_v2';
const LOCAL_STORAGE_ALL_USERS_KEY = 'mfa_vexpex_all_users_v2';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allAcademyUsers, setAllAcademyUsers] = useState<User[]>(() => getStoredItem<User[]>(LOCAL_STORAGE_ALL_USERS_KEY, ACADEMY_USERS));
  const [currentUser, setCurrentUser] = useState<User>(() => getStoredItem<User>(LOCAL_STORAGE_USER_KEY, CURRENT_USER));

  useEffect(() => setStoredItem(LOCAL_STORAGE_USER_KEY, currentUser), [currentUser]);
  useEffect(() => setStoredItem(LOCAL_STORAGE_ALL_USERS_KEY, allAcademyUsers), [allAcademyUsers]);

  // Sync the directory with the shared server so accounts created on another device appear here.
  useEffect(() => {
    let active = true;
    const syncUsers = async () => {
      try {
        const response = await fetch('/api/users');
        if (!response.ok) return;
        const data = await response.json();
        if (!active || !Array.isArray(data.users)) return;
        setAllAcademyUsers((local) => {
          const merged = new Map(local.map((u) => [u.id, u]));
          data.users.forEach((u: User) => merged.set(u.id, { ...merged.get(u.id), ...u }));
          return Array.from(merged.values());
        });
      } catch {
        // Keep cached users when the server is unavailable.
      }
    };
    syncUsers();
    const timer = window.setInterval(syncUsers, 5000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);

  const isDomainValid = (email: string): boolean => email.trim().toLowerCase().endsWith('@mpesafoundationacademy.ac.ke');

  const loginWithAcademyEmail = (
    email: string,
    name?: string,
    house: House = 'Kenya',
    role: UserRole = 'Student - IB DP2'
  ): { success: boolean; message: string } => {
    const cleanEmail = email.trim().toLowerCase();
    if (!isDomainValid(cleanEmail)) {
      return { success: false, message: 'Access Denied: MFA-VEXPEX is strictly restricted to M-PESA Foundation Academy email addresses.' };
    }

    const existing = allAcademyUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      setCurrentUser(existing);
      return { success: true, message: `Welcome back, ${existing.name}!` };
    }

    const userName = name || cleanEmail.split('@')[0].replace('.', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    const newUser: User = {
      id: `user_${Date.now()}`,
      name: userName,
      email: cleanEmail,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      coverImage: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80',
      role,
      house,
      graduationYear: '2026',
      gradeOrDept: role.includes('Staff') ? 'Academic Faculty' : 'IB DP Year 2',
      bio: `${house} House Member | M-PESA Foundation Academy`,
      location: 'Thika Campus, Kenya',
      isVerifiedAcademy: true,
      friendsCount: 15,
      joinedDate: 'August 2026',
      clubs: ['VEXPEX Community']
    };

    setAllAcademyUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);

    void fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    }).catch(() => undefined);

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
      void fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updated) }).catch(() => undefined);
      return updated;
    });
  };

  const logout = () => setCurrentUser(CURRENT_USER);

  return (
    <AuthContext.Provider value={{ currentUser, allAcademyUsers, loginWithAcademyEmail, switchUser, updateProfile, logout, isDomainValid, activeHouse: currentUser.house }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

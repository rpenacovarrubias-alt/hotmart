import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { AppUser } from '../types';
import { verifyPassword } from '../utils/password';

interface AuthContextType {
  currentUser: AppUser | null;
  setCurrentUser: (u: AppUser | null) => void;
  login: (users: AppUser[], email: string, password: string) => Promise<'ok' | 'wrong_password' | 'not_found' | 'inactive'>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const LS_KEY = 'airbnb_currentUser';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUserState] = useState<AppUser | null>(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? (JSON.parse(raw) as AppUser) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(LS_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(LS_KEY);
    }
  }, [currentUser]);

  const setCurrentUser = (u: AppUser | null) => setCurrentUserState(u);

  const login = async (
    users: AppUser[],
    email: string,
    password: string,
  ): Promise<'ok' | 'wrong_password' | 'not_found' | 'inactive'> => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) return 'not_found';
    if (user.status === 'inactive') return 'inactive';
    if (!user.passwordHash) {
      // No password set yet — allow first-time access and force password set
      setCurrentUserState({ ...user, lastLogin: new Date().toISOString() });
      return 'ok';
    }
    const valid = await verifyPassword(password, user.id, user.passwordHash);
    if (!valid) return 'wrong_password';
    setCurrentUserState({ ...user, lastLogin: new Date().toISOString() });
    return 'ok';
  };

  const logout = () => setCurrentUserState(null);

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

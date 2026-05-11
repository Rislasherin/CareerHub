'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { logoutUser } from '@/services/auth/auth.service';

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'student' | 'hr' | 'interviewer' | 'college_admin' | 'super_admin';
}

interface AuthContextType {
  user: AuthUser | null;
  login: (userData: AuthUser) => void;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Re-hydrate user from localStorage on page load
    try {
      const storedUser = localStorage.getItem('careerhub_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch {
      localStorage.removeItem('careerhub_user');
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((userData: AuthUser) => {
    setUser(userData);
    localStorage.setItem('careerhub_user', JSON.stringify(userData));
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser(); // clears httpOnly cookies on server
    } catch {
      // ignore logout errors – clear state regardless
    }
    setUser(null);
    localStorage.removeItem('careerhub_user');
    window.location.href = '/login';
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

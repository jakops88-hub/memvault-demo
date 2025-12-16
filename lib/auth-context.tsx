"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  apiKey: string;
  tier: 'FREE' | 'HOBBY' | 'PRO';
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage on mount
    const storedUser = localStorage.getItem('memvault_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const setUserWithStorage = (newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem('memvault_user', JSON.stringify(newUser));
      localStorage.setItem('memvault_api_key', newUser.apiKey); // Save API key separately
      // Save API key to cookie for middleware
      document.cookie = `memvault_api_key=${newUser.apiKey}; path=/; max-age=2592000; SameSite=Lax`; // 30 days
    } else {
      localStorage.removeItem('memvault_user');
      localStorage.removeItem('memvault_api_key');
      // Clear cookie
      document.cookie = 'memvault_api_key=; path=/; max-age=0';
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser: setUserWithStorage, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

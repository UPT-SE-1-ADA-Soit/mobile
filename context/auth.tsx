import React, { createContext, useContext, useState } from 'react';

import { MOCK_USERS } from '@/mocks/users';
import { User } from '@/types';

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function login(email: string, _password: string) {
    setIsLoading(true);
    // TODO: replace with real API call
    await new Promise<void>(resolve => setTimeout(resolve, 800));
    const found = MOCK_USERS.find(u => u.email === email) ?? MOCK_USERS[0];
    setUser(found);
    setIsLoading(false);
  }

  async function register(name: string, email: string, _password: string) {
    setIsLoading(true);
    // TODO: replace with real API call
    await new Promise<void>(resolve => setTimeout(resolve, 800));
    const newUser: User = {
      id: `u${Date.now()}`,
      name,
      email,
      avatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(email)}`,
      location: 'Unknown',
      rating: 0,
      totalSales: 0,
      joinedAt: new Date().toISOString().split('T')[0],
    };
    setUser(newUser);
    setIsLoading(false);
  }

  function logout() {
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

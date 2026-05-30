import React, { createContext, useContext, useEffect, useState } from 'react';

import { authApi } from '@/services/api';
import { clearToken, getToken, saveToken } from '@/services/storage';
import { User } from '@/types';

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isInitializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (partial: Partial<User>) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

function mapToUser(data: {
  userId: number;
  email: string;
  name: string;
  location?: string | null;
  avatarUrl?: string | null;
}): User {
  return {
    id: String(data.userId),
    name: data.name,
    email: data.email,
    location: data.location ?? undefined,
    avatar: data.avatarUrl ?? undefined,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      try {
        const token = await getToken();
        if (token) {
          const profile = await authApi.validate();
          setUser(mapToUser(profile));
        }
      } catch {
        await clearToken();
      } finally {
        setIsInitializing(false);
      }
    }
    restoreSession();
  }, []);

  async function login(email: string, password: string) {
    setIsLoading(true);
    try {
      const res = await authApi.login(email, password);
      await saveToken(res.token);
      setUser(mapToUser(res));
    } finally {
      setIsLoading(false);
    }
  }

  async function register(name: string, email: string, password: string) {
    setIsLoading(true);
    try {
      const res = await authApi.register(name, email, password);
      await saveToken(res.token);
      setUser(mapToUser(res));
    } finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    await clearToken();
    setUser(null);
  }

  function updateUser(partial: Partial<User>) {
    setUser(prev => (prev ? { ...prev, ...partial } : prev));
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, isInitializing, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

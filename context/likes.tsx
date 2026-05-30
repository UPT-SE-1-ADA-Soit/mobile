import { createContext, useContext, useEffect, useState } from 'react';

import { productApi } from '@/services/api';
import { useAuth } from './auth';

type LikesContextType = {
  toggleLike: (productId: string) => void;
  isLiked: (productId: string) => boolean;
  likedIds: Set<string>;
};

const LikesContext = createContext<LikesContextType | null>(null);

export function LikesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) {
      setLikedIds(new Set());
      return;
    }
    productApi
      .getFavorites(Number(user.id))
      .then(favorites => setLikedIds(new Set(favorites.map(f => String(f.id)))))
      .catch(() => {});
  }, [user?.id]);

  function toggleLike(productId: string) {
    if (!user) return;
    const userId = Number(user.id);
    const numProductId = Number(productId);

    setLikedIds(prev => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
        productApi.removeFavorite(userId, numProductId).catch(() => {});
      } else {
        next.add(productId);
        productApi.addFavorite(userId, numProductId).catch(() => {});
      }
      return next;
    });
  }

  function isLiked(productId: string) {
    return likedIds.has(productId);
  }

  return (
    <LikesContext.Provider value={{ toggleLike, isLiked, likedIds }}>
      {children}
    </LikesContext.Provider>
  );
}

export function useLikes() {
  const ctx = useContext(LikesContext);
  if (!ctx) throw new Error('useLikes must be used within LikesProvider');
  return ctx;
}

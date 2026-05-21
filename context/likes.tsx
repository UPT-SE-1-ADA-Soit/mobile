import { createContext, useContext, useState } from 'react';

import { MOCK_PRODUCTS } from '@/mocks/products';

type LikesContextType = {
  toggleLike: (productId: string) => void;
  isLiked: (productId: string) => boolean;
  likedIds: Set<string>;
};

const LikesContext = createContext<LikesContextType | null>(null);

export function LikesProvider({ children }: { children: React.ReactNode }) {
  const [likedIds, setLikedIds] = useState<Set<string>>(
    () => new Set(MOCK_PRODUCTS.filter(p => p.isLiked).map(p => p.id))
  );

  function toggleLike(productId: string) {
    setLikedIds(prev => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
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

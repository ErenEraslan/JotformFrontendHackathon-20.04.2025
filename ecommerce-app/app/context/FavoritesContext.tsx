'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { ProductItem } from '../api/jotform';

interface FavoritesContextType {
  favorites: ProductItem[];
  addToFavorites: (product: ProductItem) => void;
  removeFromFavorites: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  clearFavorites: () => void;
  toggleFavorite: (product: ProductItem) => void;
}

const FAVORITES_STORAGE_KEY = 'jotshop_favorites';

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

// Helper function to safely parse JSON
const safeJSONParse = <T,>(json: string | null, fallback: T): T => {
  if (!json) return fallback;
  try {
    return JSON.parse(json) as T;
  } catch (e) {
    console.error('Error parsing JSON from localStorage:', e);
    return fallback;
  }
};

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  // Initialize state from localStorage if available, otherwise use empty array
  const [favorites, setFavorites] = useState<ProductItem[]>(() => {
    if (typeof window === 'undefined') return []; // Handle server-side rendering
    return safeJSONParse(localStorage.getItem(FAVORITES_STORAGE_KEY), []);
  });

  // Load favorites from localStorage when the component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedFavorites = safeJSONParse(localStorage.getItem(FAVORITES_STORAGE_KEY), []);
      setFavorites(storedFavorites);
    }
  }, []);

  // Save to localStorage whenever favorites change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    }
  }, [favorites]);

  const addToFavorites = (product: ProductItem) => {
    // Avoid duplicates by checking if product already exists in favorites
    if (!isFavorite(product.id)) {
      setFavorites(prev => [...prev, product]);
    }
  };

  const removeFromFavorites = (productId: string) => {
    setFavorites(prev => prev.filter(product => product.id !== productId));
  };

  const isFavorite = (productId: string): boolean => {
    return favorites.some(product => product.id === productId);
  };

  const toggleFavorite = (product: ProductItem) => {
    if (isFavorite(product.id)) {
      removeFromFavorites(product.id);
    } else {
      addToFavorites(product);
    }
  };

  const clearFavorites = () => {
    setFavorites([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(FAVORITES_STORAGE_KEY);
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
        clearFavorites,
        toggleFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}; 
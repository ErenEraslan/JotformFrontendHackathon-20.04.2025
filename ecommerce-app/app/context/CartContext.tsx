'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ProductItem } from '../api/jotform';

type CartItem = ProductItem & {
  quantity: number;
};

interface CartSource {
  items: CartItem[];
  source: string;
  totalItems: number;
  totalPrice: number;
}

interface CartContextType {
  items: CartItem[];
  sources: Record<string, CartSource>;
  currentSource: string;
  setCurrentSource: (source: string) => void;
  addToCart: (product: ProductItem) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  clearAllCarts: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [sources, setSources] = useState<Record<string, CartSource>>({});
  const [currentSource, setCurrentSource] = useState<string>('');

  const addToCart = (product: ProductItem) => {
    // Ensure product has a source
    const source = product.source || 'default';
    
    // If trying to add a product from a different source than the current cart
    if (currentSource && currentSource !== source && Object.keys(sources).includes(currentSource) && sources[currentSource].items.length > 0) {
      if (!confirm(`Adding this product will clear your current cart because it's from a different source. Continue?`)) {
        return;
      }
      
      // Clear the current cart if user confirms
      setSources(prev => ({
        ...prev,
        [currentSource]: {
          items: [],
          source: currentSource,
          totalItems: 0,
          totalPrice: 0
        }
      }));
    }
    
    // Set the current source to the product's source
    setCurrentSource(source);
    
    setSources(prev => {
      // Get the source cart or create a new one
      const sourceCart = prev[source] || { items: [], source, totalItems: 0, totalPrice: 0 };
      const existingItem = sourceCart.items.find(item => item.id === product.id);
      
      let updatedItems;
      if (existingItem) {
        updatedItems = sourceCart.items.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        updatedItems = [...sourceCart.items, { ...product, quantity: 1 }];
      }
      
      // Calculate totals
      const totalItems = updatedItems.reduce((total, item) => total + item.quantity, 0);
      const totalPrice = updatedItems.reduce((total, item) => total + item.price * item.quantity, 0);
      
      return {
        ...prev,
        [source]: {
          items: updatedItems,
          source,
          totalItems,
          totalPrice
        }
      };
    });
  };

  const removeFromCart = (productId: string) => {
    if (!currentSource) return;
    
    setSources(prev => {
      const sourceCart = prev[currentSource];
      if (!sourceCart) return prev;
      
      const updatedItems = sourceCart.items.filter(item => item.id !== productId);
      
      // Calculate totals
      const totalItems = updatedItems.reduce((total, item) => total + item.quantity, 0);
      const totalPrice = updatedItems.reduce((total, item) => total + item.price * item.quantity, 0);
      
      return {
        ...prev,
        [currentSource]: {
          ...sourceCart,
          items: updatedItems,
          totalItems,
          totalPrice
        }
      };
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (!currentSource) return;
    
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setSources(prev => {
      const sourceCart = prev[currentSource];
      if (!sourceCart) return prev;
      
      const updatedItems = sourceCart.items.map(item =>
        item.id === productId ? { ...item, quantity } : item
      );
      
      // Calculate totals
      const totalItems = updatedItems.reduce((total, item) => total + item.quantity, 0);
      const totalPrice = updatedItems.reduce((total, item) => total + item.price * item.quantity, 0);
      
      return {
        ...prev,
        [currentSource]: {
          ...sourceCart,
          items: updatedItems,
          totalItems,
          totalPrice
        }
      };
    });
  };

  const clearCart = () => {
    if (!currentSource) return;
    
    setSources(prev => {
      return {
        ...prev,
        [currentSource]: {
          items: [],
          source: currentSource,
          totalItems: 0,
          totalPrice: 0
        }
      };
    });
  };
  
  const clearAllCarts = () => {
    setSources({});
    setCurrentSource('');
  };

  // Get items and totals for the current source
  const items = currentSource && sources[currentSource] ? sources[currentSource].items : [];
  const totalItems = currentSource && sources[currentSource] ? sources[currentSource].totalItems : 0;
  const totalPrice = currentSource && sources[currentSource] ? sources[currentSource].totalPrice : 0;

  return (
    <CartContext.Provider
      value={{
        items,
        sources,
        currentSource,
        setCurrentSource,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        clearAllCarts,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 
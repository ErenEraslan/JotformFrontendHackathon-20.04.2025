'use client';

import React, { useState, useEffect } from 'react';
import { useFavorites } from '../context/FavoritesContext';
import ProductCard from '../components/ProductCard';
import { FiHeart, FiTrash2 } from 'react-icons/fi';
import Link from 'next/link';

const FavoritesPage: React.FC = () => {
  const { favorites, clearFavorites } = useFavorites();
  const [favoriteItems, setFavoriteItems] = useState(favorites);

  // Update local state when favorites change in the context
  useEffect(() => {
    setFavoriteItems(favorites);
  }, [favorites]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 bg-white">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <FiHeart className="mr-2 h-6 w-6 text-red-500" />
          My Favorites
        </h1>
        
        {favoriteItems.length > 0 && (
          <button
            onClick={clearFavorites}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <FiTrash2 className="mr-2 h-4 w-4 text-gray-500" />
            Clear All
          </button>
        )}
      </div>

      {favoriteItems.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <FiHeart className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-4 text-lg font-medium text-gray-900">No favorites yet</h2>
          <p className="mt-2 text-sm text-gray-500">
            Start adding products to your favorites list to see them here.
          </p>
          <Link 
            href="/"
            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {favoriteItems.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage; 
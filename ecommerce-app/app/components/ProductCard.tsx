'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiShoppingCart, FiX, FiZoomIn, FiHeart } from 'react-icons/fi';
import { ProductItem } from '../api/jotform';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';

interface ProductCardProps {
  product: ProductItem & { source?: string };
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [imageError, setImageError] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isProductFavorite, setIsProductFavorite] = useState(false);
  const fallbackImage = `https://placehold.co/400x300/4096ff/ffffff?text=${encodeURIComponent(product.name)}`;

  // Ensure we're using the product ID correctly for favorites
  const getProductId = () => {
    // If the ID contains an underscore (like "form1_123"), it's a prefixed ID
    // In this case, we need to use the original ID for favorites to work correctly
    if (product.id.includes('_')) {
      return product.id;
    }
    return product.id;
  };

  // Update favorite state when component mounts or when favorites list changes
  useEffect(() => {
    setIsProductFavorite(isFavorite(getProductId()));
  }, [product.id, isFavorite]);

  // Get the primary image to display
  const getImageUrl = () => {
    if (imageError) return fallbackImage;
    
    // If we have images array and it has items, use the first one
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    
    // Fallback to single image property or default placeholder
    return product.image || fallbackImage;
  };

  const openImageModal = () => {
    setIsAnimating(true);
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsImageModalOpen(false);
    }, 300); // Match the animation duration
  };

  // Close modal when Escape key is pressed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isImageModalOpen) {
        closeImageModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isImageModalOpen]);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(product);
    setIsProductFavorite(!isProductFavorite);
  };

  return (
    <>
      <div className="group flex flex-col h-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md transition-all duration-300 hover:shadow-xl hover:scale-105 transform">
        <div className="relative h-64 w-full overflow-hidden bg-gray-200">
          <button 
            className="absolute top-2 right-2 z-10 rounded-full bg-white p-1.5 shadow-md hover:scale-110 transition-transform"
            onClick={handleFavoriteClick}
            aria-label={isProductFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <FiHeart 
              className={`h-5 w-5 ${isProductFavorite ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} 
            />
          </button>
          
          <Link href={`/product/${product.id}`}>
            <Image
              src={getImageUrl()}
              alt={product.name}
              className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-110 cursor-pointer"
              width={400}
              height={300}
              onError={() => setImageError(true)}
              priority={false}
              unoptimized={true}
            />
          </Link>
          <button 
            className="absolute bottom-2 right-2 rounded-full bg-white p-1.5 shadow-md opacity-80 hover:opacity-100 transition-opacity"
            onClick={openImageModal}
            aria-label="View larger image"
          >
            <FiZoomIn className="h-5 w-5 text-gray-700" />
          </button>
        </div>
        
        <div className="flex flex-1 flex-col p-4">
          <div className="mb-2 flex items-start justify-between">
            <Link href={`/product/${product.id}`} className="hover:text-blue-600">
              <h3 className="text-lg font-medium text-gray-900 line-clamp-2">{product.name}</h3>
            </Link>
            <p className="ml-2 text-lg font-semibold text-blue-600">${product.price.toFixed(2)}</p>
          </div>
          
          <p className="mb-4 flex-1 text-sm text-gray-700 line-clamp-3">
            {product.description}
          </p>
          
          <div className="mt-auto">
            {product.stock && product.stock > 0 ? (
              <button
                onClick={() => addToCart(product)}
                className="flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                <FiShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </button>
            ) : (
              <button
                disabled
                className="flex w-full items-center justify-center rounded-md bg-gray-300 px-4 py-2 text-sm font-medium text-gray-500"
              >
                Out of Stock
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {isImageModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
          onClick={closeImageModal}
        >
          <div 
            className={`relative bg-white rounded-lg shadow-2xl p-2 transition-all duration-300 ${isAnimating ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeImageModal}
              className="absolute -top-3 -right-3 z-10 rounded-full bg-white p-2 shadow-lg border border-gray-200"
              aria-label="Close image"
            >
              <FiX className="h-6 w-6 text-gray-900" />
            </button>
            <div className="relative">
              <Image
                src={getImageUrl()}
                alt={product.name}
                className="rounded-md max-h-[80vh] max-w-[90vw] w-auto object-contain"
                width={800}
                height={600}
                unoptimized={true}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard; 
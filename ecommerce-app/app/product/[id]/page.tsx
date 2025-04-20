'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiArrowLeft, FiShoppingCart, FiHeart } from 'react-icons/fi';
import { fetchProducts, ProductItem } from '../../api/jotform';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';
import ProductCard from '../../components/ProductCard';

const ProductDetailsPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  
  const [product, setProduct] = useState<ProductItem | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ProductItem[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProductFavorite, setIsProductFavorite] = useState(false);

  // Update favorite state when product changes or favorites list changes
  useEffect(() => {
    if (product) {
      setIsProductFavorite(isFavorite(product.id));
    }
  }, [product, isFavorite]);

  // Fetch product and related products data
  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch products from all sources
        const allProducts: ProductItem[] = [];
        const forms = [
          { formId: '251074116166956', source: 'form1' },
          { formId: '251073669442965', source: 'form2' },
          { formId: '251073643151954', source: 'form3' }
        ];
        
        for (const form of forms) {
          const formProducts = await fetchProducts(form.formId);
          // Add source to each product and create products with both original and prefixed IDs
          const productsWithSource = formProducts.map(p => {
            const withOriginalId = { ...p, source: form.source };
            // Also create a version with a prefixed ID to match the products page format
            const withPrefixedId = { 
              ...withOriginalId, 
              id: `${form.source}_${p.id}` 
            };
            allProducts.push(withPrefixedId);
            return withOriginalId;
          });
          allProducts.push(...productsWithSource);
        }
        
        // Find the current product
        // First, try to find by exact ID match
        let foundProduct = allProducts.find(p => p.id === productId);
        
        // If not found, check if the ID has a form prefix (form1_, form2_, etc.)
        if (!foundProduct) {
          // Try to extract the actual product ID from the prefixed ID
          const idParts = productId.split('_');
          if (idParts.length > 1) {
            const actualId = idParts[idParts.length - 1];
            foundProduct = allProducts.find(p => p.id === actualId);
          }
        }
        
        // If still not found, check if any product's ID is contained within the current productId
        if (!foundProduct) {
          foundProduct = allProducts.find(p => productId.includes(p.id));
        }
        
        if (!foundProduct) {
          setError('Product not found');
          setLoading(false);
          return;
        }
        
        setProduct(foundProduct);
        setSelectedImage(foundProduct.image || (foundProduct.images && foundProduct.images[0]) || null);
        
        // Find related products (same category, excluding current product)
        const related = allProducts.filter(p => 
          p.id !== productId && 
          p.category === foundProduct.category
        ).slice(0, 4); // Limit to 4 related products
        
        setRelatedProducts(related);
      } catch (err) {
        setError('Failed to load product data');
        console.error('Error fetching product data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (productId) {
      fetchProductData();
    }
  }, [productId]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQuantity(parseInt(e.target.value, 10));
  };

  const handleAddToCart = () => {
    if (product) {
      // Add product to cart multiple times based on quantity
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
      
      // Show success feedback (could be enhanced with a toast notification)
      alert(`Added ${quantity} ${quantity === 1 ? 'item' : 'items'} to cart`);
    }
  };

  const handleToggleFavorite = () => {
    if (product) {
      toggleFavorite(product);
      setIsProductFavorite(!isProductFavorite);
    }
  };

  // Get all images (main image + additional images)
  const getProductImages = () => {
    if (!product) return [];
    
    const images: string[] = [];
    if (product.image) images.push(product.image);
    if (product.images && Array.isArray(product.images)) {
      images.push(...product.images.filter(img => img !== product.image));
    }
    
    // If no images, add a placeholder
    if (images.length === 0) {
      images.push(`https://placehold.co/400x300/4096ff/ffffff?text=${encodeURIComponent(product.name)}`);
    }
    
    return images;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <h1 className="text-2xl font-bold text-red-600">{error || 'Product not found'}</h1>
        <button 
          onClick={() => router.push('/')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const images = getProductImages();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 bg-white">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center text-gray-700 hover:text-blue-600 mb-6"
      >
        <FiArrowLeft className="mr-2 h-5 w-5" />
        Back
      </button>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Product Images */}
        <div className="space-y-4">
          {/* Main image */}
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <Image 
              src={selectedImage || images[0]}
              alt={product.name}
              className="w-full h-full object-contain"
              width={600}
              height={600}
              unoptimized={true}
            />
          </div>
          
          {/* Image thumbnails */}
          {images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(image)}
                  className={`aspect-square rounded overflow-hidden border-2 ${
                    selectedImage === image ? 'border-blue-600' : 'border-transparent'
                  }`}
                >
                  <Image 
                    src={image}
                    alt={`${product.name} - view ${index + 1}`}
                    className="w-full h-full object-cover"
                    width={80}
                    height={80}
                    unoptimized={true}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Product Info */}
        <div className="flex flex-col">
          <div className="mb-auto">
            <div className="flex items-start justify-between">
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{product.name}</h1>
              <p className="text-2xl font-semibold text-blue-600">${product.price.toFixed(2)}</p>
            </div>
            
            {product.category && (
              <p className="mt-1 text-sm text-gray-600">
                Category: <span className="font-medium">{product.category}</span>
              </p>
            )}
            
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900">Description</h3>
              <p className="mt-2 text-gray-700 whitespace-pre-line">{product.description}</p>
            </div>
            
            {product.stock !== undefined && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900">Availability</h3>
                <p className="mt-2 text-gray-700">
                  {product.stock > 0 
                    ? `In stock (${product.stock} available)` 
                    : 'Out of stock'}
                </p>
              </div>
            )}
          </div>
          
          {/* Add to cart section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="w-full sm:w-1/3">
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <select
                  id="quantity"
                  name="quantity"
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="block w-full rounded-md border-gray-300 py-2 px-3 text-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  disabled={product.stock === 0}
                >
                  {Array.from({ length: product.stock || 10 }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
              
              <div className="w-full sm:w-2/3 flex space-x-2">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={`flex-1 flex items-center justify-center rounded-md px-4 py-3 text-base font-medium text-white ${
                    product.stock === 0 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  <FiShoppingCart className="mr-2 h-5 w-5" />
                  {product.stock === 0 ? 'Out of stock' : 'Add to Cart'}
                </button>
                
                <button
                  onClick={handleToggleFavorite}
                  className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-3 text-base font-medium hover:bg-gray-50"
                  aria-label={isProductFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                  <FiHeart 
                    className={`h-5 w-5 ${isProductFavorite ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} 
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
          <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {relatedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailsPage; 
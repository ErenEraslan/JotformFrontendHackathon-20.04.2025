'use client';

import { useEffect, useState } from 'react';
import HeroSection from './components/HeroSection';
import ProductGrid from './components/ProductGrid';
import { fetchProducts, ProductItem, FORM_IDS } from './api/jotform';
import ShoppingCart from './components/ShoppingCart';
import { FiTrendingUp, FiStar, FiShield } from 'react-icons/fi';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<ProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        // Fetch products from all three forms
        const form1Products = await fetchProducts(FORM_IDS.form1);
        const form2Products = await fetchProducts(FORM_IDS.form2);
        const form3Products = await fetchProducts(FORM_IDS.form3);
        
        // Sort products by price (descending order)
        const sortedForm1 = [...form1Products].sort((a, b) => b.price - a.price);
        const sortedForm2 = [...form2Products].sort((a, b) => b.price - a.price);
        const sortedForm3 = [...form3Products].sort((a, b) => b.price - a.price);
        
        // Get the most expensive products from each form
        const form1Selection = sortedForm1.slice(0, 4); // 3 most expensive from form1
        const form2Selection = sortedForm2.slice(0, 4); // 3 most expensive from form2
        const form3Selection = sortedForm3.slice(1, 5); // 2 most expensive from form3
        
        // Combine all selected products
        const selectedProducts = [
          ...form1Selection.map(p => ({ ...p, source: 'Form 1' })),
          ...form2Selection.map(p => ({ ...p, source: 'Form 2' })),
          ...form3Selection.map(p => ({ ...p, source: 'Form 3' }))
        ];
        
        // Update state with selected products
        setFeaturedProducts(selectedProducts);
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      
      {/* Features Section */}
      <section className="py-12 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
            Why Shop With Us
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <FiTrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="mt-3 text-lg font-medium text-gray-900">Top Quality Products</h3>
              <p className="mt-2 text-gray-700">
                Our products are sourced from the best manufacturers to ensure quality and durability.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <FiStar className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="mt-3 text-lg font-medium text-gray-900">Customer Satisfaction</h3>
              <p className="mt-2 text-gray-700">
                We prioritize customer satisfaction with exceptional service and support.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <FiShield className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="mt-3 text-lg font-medium text-gray-900">Secure Shopping</h3>
              <p className="mt-2 text-gray-700">
                Shop with confidence knowing your personal information is protected.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
              Premium Products
            </h2>
            <p className="mt-4 text-center text-gray-700">
              Discover our selection of top-tier products from multiple collections
            </p>
          </div>
          <ProductGrid products={featuredProducts} isLoading={isLoading} />
        </div>
      </section>

      {/* Shopping Cart Component */}
      <ShoppingCart />
    </div>
  );
}

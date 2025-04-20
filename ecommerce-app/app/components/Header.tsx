'use client';

import React, { useState, useContext } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiMenu, FiX, FiShoppingBag, FiShoppingCart, FiHeart } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { CartOpenContext } from './ShoppingCart';
import logo from '../../public/jotform-icon.png';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { totalItems } = useCart();
  const { openCart } = useContext(CartOpenContext);

  return (
    <header className="sticky top-0 z-40 w-full bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Image 
                src={logo} 
                alt="JotShop Logo" 
                className="h-10 w-10 rounded-full" 
                width={40} 
                height={40} 
                priority 
              />
              <span className="ml-2 text-xl font-bold text-gray-900">JotShop</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex md:items-center md:space-x-8">
            <Link
              href="/"
              className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-900 hover:border-blue-500 hover:text-blue-600"
            >
              Home
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-700 hover:border-blue-500 hover:text-blue-600"
            >
              Products
            </Link>
            <Link
              href="/favorites"
              className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-700 hover:border-blue-500 hover:text-blue-600"
            >
              
              Favorites
            </Link>
            
            {totalItems > 0 && (
              <Link
                href="/checkout"
                className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-700 hover:border-blue-500 hover:text-blue-600"
              >
                Checkout
              </Link>
            )}
            {/* Developer tools - only show in development */}
            {process.env.NODE_ENV !== 'production' && (
              <Link
                href="/form-details"
                className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-indigo-600 hover:border-indigo-500 hover:text-indigo-800"
              >
                Form Details
              </Link>
            )}
          </nav>

          {/* Right side icons */}
          <div className="flex items-center">
            
            {/* Mobile menu button */}
            <button
              type="button"
              className="ml-2 inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-700 md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <FiX className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <FiMenu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="space-y-1 pb-3 pt-2">
            <Link
              href="/"
              className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-700 hover:border-blue-500 hover:bg-gray-50 hover:text-blue-600"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/products"
              className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-700 hover:border-blue-500 hover:bg-gray-50 hover:text-blue-600"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Products
            </Link>
            <Link
              href="/favorites"
              className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-700 hover:border-blue-500 hover:bg-gray-50 hover:text-blue-600"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="flex items-center">
                <FiHeart className="mr-2 h-5 w-5" />
                Favorites
              </div>
            </Link>
            <Link
              href="/about"
              className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-700 hover:border-blue-500 hover:bg-gray-50 hover:text-blue-600"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </Link>
            {totalItems > 0 && (
              <Link
                href="/checkout"
                className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-700 hover:border-blue-500 hover:bg-gray-50 hover:text-blue-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Checkout
              </Link>
            )}
            {/* Developer tools - only show in development */}
            {process.env.NODE_ENV !== 'production' && (
              <Link
                href="/form-details"
                className="block border-l-4 border-indigo-500 py-2 pl-3 pr-4 text-base font-medium text-indigo-700 bg-indigo-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Form Details
              </Link>
            )}
            {/* Shopping cart link for mobile */}
            <button
              className="flex w-full items-center border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-700 hover:border-blue-500 hover:bg-gray-50 hover:text-blue-600"
              onClick={() => {
                setIsMobileMenuOpen(false);
                openCart();
              }}
            >
              <FiShoppingCart className="mr-2 h-5 w-5" />
              Cart {totalItems > 0 && `(${totalItems})`}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header; 
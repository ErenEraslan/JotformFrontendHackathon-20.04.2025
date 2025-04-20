'use client';

import React, { useState, useContext } from 'react';
import Link from 'next/link';
import { FiMenu, FiX, FiShoppingBag, FiShoppingCart } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { CartOpenContext } from './ShoppingCart';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { totalItems } = useCart();
  const openCart = useContext(CartOpenContext);

  return (
    <header className="sticky top-0 z-40 w-full bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <FiShoppingBag className="h-8 w-8 text-blue-600" />
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
              href="/categories"
              className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-700 hover:border-blue-500 hover:text-blue-600"
            >
              Categories
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-700 hover:border-blue-500 hover:text-blue-600"
            >
              About
            </Link>
          </nav>

          {/* Cart and Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            {/* Cart Icon */}
            <button
              className="relative flex items-center text-gray-700 hover:text-blue-600 transition-colors"
              onClick={openCart}
              aria-label="Open shopping cart"
            >
              <FiShoppingCart className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  {totalItems}
                </span>
              )}
            </button>

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
              href="/categories"
              className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-700 hover:border-blue-500 hover:bg-gray-50 hover:text-blue-600"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Categories
            </Link>
            <Link
              href="/about"
              className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-700 hover:border-blue-500 hover:bg-gray-50 hover:text-blue-600"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </Link>
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
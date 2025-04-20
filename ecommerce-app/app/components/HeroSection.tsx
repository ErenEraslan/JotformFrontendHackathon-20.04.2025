'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const HeroSection: React.FC = () => {
  return (
    <div className="relative bg-gray-900 text-white">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="relative h-full w-full">
          <Image
            src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
            alt="Hero background"
            className="h-full w-full object-cover object-center"
            fill
            sizes="100vw"
            priority
            unoptimized={true}
            style={{
              objectFit: 'cover',
            }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            <span className="block mb-2">Spring Collection</span>
            <span className="block text-blue-400">2025 Edition</span>
          </h1>
          <p className="mt-6 max-w-xl text-xl text-gray-200">
            Discover our latest products with premium quality and amazing designs. Limited time offers available now.
          </p>
          <div className="mt-10 flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            <Link
              href="/products"
              className="rounded-md bg-blue-600 px-8 py-3 text-center text-base font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              Shop Now
            </Link>
           
          </div>
        </div>
      </div>

      {/* Animated Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 animate-bounce md:block">
        <div className="flex flex-col items-center">
          <span className="mb-2 text-sm font-medium">Scroll Down</span>
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default HeroSection; 
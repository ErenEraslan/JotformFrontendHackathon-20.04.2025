'use client';

import { useEffect, useState } from 'react';
import { fetchProducts, ProductItem, FORM_IDS } from '../api/jotform';
import ProductGrid from '../components/ProductGrid';
import ShoppingCart from '../components/ShoppingCart';
import { FiSearch, FiFilter, FiX, FiChevronDown } from 'react-icons/fi';

// Sort options
type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductItem[]>([]);
  const [sortedProducts, setSortedProducts] = useState<ProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedFormId, setSelectedFormId] = useState(FORM_IDS.form1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const fetchedProducts = await fetchProducts(selectedFormId);
        setProducts(fetchedProducts);
        
        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(fetchedProducts.map((product) => product.category || 'Uncategorized'))
        );
        setCategories(['all', ...uniqueCategories]);
        
        // Find max price for range
        const maxPrice = Math.max(...fetchedProducts.map((product) => product.price), 1000);
        setPriceRange([0, maxPrice]);
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [selectedFormId]);

  useEffect(() => {
    // Apply filters whenever filter criteria change
    let result = [...products];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(term) ||
          product.description.toLowerCase().includes(term)
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      result = result.filter(
        (product) => (product.category || 'Uncategorized') === selectedCategory
      );
    }

    // Apply price range filter
    result = result.filter(
      (product) => product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    setFilteredProducts(result);
  }, [products, searchTerm, selectedCategory, priceRange]);

  // Apply sorting whenever filteredProducts or sortBy changes
  useEffect(() => {
    let sorted = [...filteredProducts];
    
    switch (sortBy) {
      case 'price-asc':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'newest':
      default:
        // Assuming newest items are at the beginning of the array
        // If you have a date field, you could use that instead
        break;
    }
    
    setSortedProducts(sorted);
  }, [filteredProducts, sortBy]);

  // Change data source handler
  const handleDataSourceChange = (formId: string) => {
    setSelectedFormId(formId);
  };

  // Handle sort change
  const handleSortChange = (option: SortOption) => {
    setSortBy(option);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Page Header */}
      <div className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">All Products</h1>
          <p className="mt-2 text-gray-700">Browse our latest collection of products</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Top Filter Bar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Box */}
          <div className="relative w-full sm:max-w-xs">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-md border border-gray-300 pl-10 pr-4 py-2 text-gray-800 placeholder-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <FiSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-700" />
          </div>

          {/* Data Source Selector */}
          <div className="flex gap-2">
            <select 
              value={selectedFormId}
              onChange={(e) => handleDataSourceChange(e.target.value)}
              className="rounded-md border border-gray-300 py-2 pl-3 pr-10 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value={FORM_IDS.form1}>Form 1</option>
              <option value={FORM_IDS.form2}>Form 2</option>
              <option value={FORM_IDS.form3}>Form 3</option>
            </select>
            
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm border border-gray-300 hover:bg-gray-50 focus:outline-none"
            >
              <FiFilter className="mr-2 h-5 w-5 text-gray-700" />
              Filters
            </button>
          </div>
        </div>

        {/* Filter Sidebar (Mobile Responsive) */}
        {isFilterOpen && (
          <div className="mb-8 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Filters</h3>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="text-gray-600 hover:text-gray-700"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Category Filter */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div>
                <label htmlFor="price-range" className="block text-sm font-medium text-gray-700">
                  Price Range: ${priceRange[0]} - ${priceRange[1]}
                </label>
                <div className="mt-1 flex flex-col gap-2">
                  <input
                    type="range"
                    min={0}
                    max={priceRange[1]}
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                    className="w-full"
                  />
                  <input
                    type="range"
                    min={priceRange[0]}
                    max={Math.max(...products.map((p) => p.price), 1000)}
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Reset Filters */}
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setPriceRange([0, Math.max(...products.map((p) => p.price), 1000)]);
                  }}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Product Count and Sort */}
        <div className="mb-6 flex flex-col gap-4 justify-between sm:flex-row sm:items-center">
          <p className="text-sm text-gray-700">
            Showing {sortedProducts.length} of {products.length} products
          </p>
          
          {/* Sort Options */}
          <div className="relative">
            <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 mb-1">
              Sort by:
            </label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as SortOption)}
              className="appearance-none rounded-md border border-gray-300 py-2 pl-3 pr-10 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 top-6 flex items-center pr-2">
              <FiChevronDown className="h-5 w-5 text-gray-500" />
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <ProductGrid products={sortedProducts} isLoading={isLoading} />
      </div>

      {/* Shopping Cart Component */}
      <ShoppingCart />
    </div>
  );
} 
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
  const [selectedFormId, setSelectedFormId] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [maxPrice, setMaxPrice] = useState(1000);

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      let fetchedProducts: ProductItem[] = [];
      
      try {
        if (selectedFormId === 'all') {
          console.log('Loading products from all forms');
          // Fetch products from all forms
          const form1Products = await fetchProducts(FORM_IDS.form1);
          const form2Products = await fetchProducts(FORM_IDS.form2);
          const form3Products = await fetchProducts(FORM_IDS.form3);
          
          console.log(`Form 1 products: ${form1Products.length}`);
          console.log(`Form 2 products: ${form2Products.length}`);
          console.log(`Form 3 products: ${form3Products.length}`);
          
          // Map products with unique IDs and source labels
          fetchedProducts = [
            ...form1Products.map(p => ({ ...p, id: `form1_${p.id}`, source: 'Form 1' })),
            ...form2Products.map(p => ({ ...p, id: `form2_${p.id}`, source: 'Form 2' })),
            ...form3Products.map(p => ({ ...p, id: `form3_${p.id}`, source: 'Form 3' }))
          ];
        } else {
          console.log(`Loading products from form ${selectedFormId}`);
          let formPrefix = 'form3';
          
          if (selectedFormId === FORM_IDS.form1) {
            formPrefix = 'form1';
          } else if (selectedFormId === FORM_IDS.form2) {
            formPrefix = 'form2';
          }
          
          fetchedProducts = await fetchProducts(selectedFormId);
          fetchedProducts = fetchedProducts.map(p => ({ 
            ...p, 
            id: `${formPrefix}_${p.id}`,
            source: `Form ${formPrefix.slice(-1)}` 
          }));
        }
        
        console.log(`Total fetched products: ${fetchedProducts.length}`);
        
        // Ensure every product has a category, defaulting to "Uncategorized"
        fetchedProducts = fetchedProducts.map(p => ({
          ...p,
          category: p.category ? p.category.trim() : 'Uncategorized'
        }));
        
        // Extract and log all categories from products
        const rawCategories = fetchedProducts.map(p => p.category || 'Uncategorized');
        console.log('Raw categories from products:', rawCategories);
        
        // Get unique categories and sort them
        const uniqueCategories = [...new Set(rawCategories)]
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b));
        
        console.log('Unique categories found:', uniqueCategories);
        
        // Update state with products
        setProducts(fetchedProducts);
        
        // Calculate the count of products in each category
        const categoryCounts: Record<string, number> = {};
        uniqueCategories.forEach(category => {
          categoryCounts[category] = fetchedProducts.filter(p => 
            (p.category || 'Uncategorized') === category
          ).length;
        });
        
        console.log('Category counts:', categoryCounts);
        
        // Always include "all" category
        const finalCategories = ['all', ...uniqueCategories];
        console.log('Final categories array:', finalCategories);
        
        // Update state with categories
        setCategories(finalCategories);
        
        // Reset the selected category to 'all' when changing forms
        setSelectedCategory('all');
        
        // Calculate price range for the filter
        const prices = fetchedProducts.map(p => p.price);
        const minPrice = Math.min(...prices, 0);
        const maxPrice = Math.max(...prices, 1000);
        setPriceRange([minPrice, maxPrice]);
        setMaxPrice(maxPrice);
      } catch (error) {
        console.error('Error loading products:', error);
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

  // Set fallback categories if none are found
  useEffect(() => {
    // If we have products but no categories or only a few categories, add more
    if (products.length > 0 && categories.length < 8) {
      console.log('Setting additional categories because too few were found');
      
      // Keep existing categories and add some common ones if they're not already present
      const commonCategories = [
        'Electronics', 'Clothing', 'Home & Garden', 'Sports', 
        'Beauty', 'Food', 'Accessories', 'Furniture'
      ];
      
      // Filter out categories that already exist
      const additionalCategories = commonCategories.filter(
        cat => !categories.includes(cat)
      );
      
      // Combine existing and new categories, ensuring 'all' is first
      const updatedCategories = categories.includes('all') 
        ? ['all', ...categories.filter(c => c !== 'all'), ...additionalCategories] 
        : ['all', ...categories, ...additionalCategories];
      
      // Remove duplicates
      const uniqueCategories = [...new Set(updatedCategories)];
      
      console.log('Updated categories array:', uniqueCategories);
      setCategories(uniqueCategories);
    }
  }, [products, categories]);

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

  // Get category counts for display
  const getCategoryCount = (category: string): number => {
    if (category === 'all') return products.length;
    return products.filter(p => (p.category || 'Uncategorized') === category).length;
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
              className="w-full rounded-md border border-gray-700 pl-10 pr-4 py-2 text-gray-800 placeholder-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <FiSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-700" />
          </div>

          {/* Data Source Selector */}
          <div className="flex gap-2">
            <select 
              value={selectedFormId}
              onChange={(e) => setSelectedFormId(e.target.value)}
              className="rounded-md border-2 border-blue-400 py-2 pl-3 pr-10 text-gray-800 font-medium focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all" className="font-semibold">All Sources</option>
              <option value={FORM_IDS.form1} className="font-medium">Form 1</option>
              <option value={FORM_IDS.form2} className="font-medium">Form 2</option>
              <option value={FORM_IDS.form3} className="font-medium">Form 3</option>
            </select>
            
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm border-2 border-blue-400 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <FiFilter className="mr-2 h-5 w-5 text-blue-600" />
              Filters
            </button>
          </div>
        </div>

        {/* Category Pills - Always visible */}
        <div className="mb-8 overflow-x-auto pb-2">
          <h2 className="text-lg font-medium text-gray-900 mb-3">Categories ({categories.length} found)</h2>
          <div className="flex gap-2 flex-wrap md:flex-nowrap">
            {categories.length === 0 ? (
              <div className="text-gray-500">Loading categories...</div>
            ) : (
              categories.map((category) => {
                const count = getCategoryCount(category);
                console.log(`Category: ${category}, Count: ${count}`);
                
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`mb-2 whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white text-gray-700 border border-gray-700 hover:bg-gray-50 hover:border-blue-700'
                    }`}
                  >
                    {category === 'all' ? 'All Categories' : category}
                    <span className={`ml-1 ${selectedCategory === category ? 'text-blue-100' : 'text-gray-500'}`}>
                      ({count})
                    </span>
                  </button>
                );
              })
            )}
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
                  className="mt-1 block w-full rounded-md border border-gray-700 py-2 pl-3 pr-10 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                    max={maxPrice}
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                    className="w-full"
                  />
                  <input
                    type="range"
                    min={priceRange[0]}
                    max={maxPrice}
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
                    setPriceRange([0, maxPrice]);
                  }}
                  className="rounded-md border border-gray-700 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
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
            {selectedCategory !== 'all' && (
              <span className="ml-1 font-medium">
                in <span className="text-blue-600">{selectedCategory}</span>
              </span>
            )}
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
              className="appearance-none rounded-md border border-gray-700 py-2 pl-3 pr-10 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
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
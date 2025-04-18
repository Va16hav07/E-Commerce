import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Product } from '../types';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useCart } from '../context/CartContext';
import { productAPI } from '../services/api';
import ProductCard from '../components/ProductCard';

export default function ProductListingPage() {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  useCart();
  
  // Add loading and error states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState({
    category: categoryParam || 'all',
    priceRange: 'all',
    sortBy: 'featured',
    color: 'all',
    size: 'all'
  });
  const [isMobileFilterOpen, setMobileFilterOpen] = useState(false);
  
  // Extract all categories from products
  const categories = ['all', ...new Set(products.map(p => p.category))];
  
  // Extract all available colors from products
  const availableColors = ['all', ...new Set(products.flatMap(p => p.variants.map(v => v.color)))];
  
  // Extract all available sizes from products
  const availableSizes = ['all', ...new Set(products.flatMap(p => p.variants.map(v => v.size)))];
  
  // Price ranges
  const priceRanges = [
    { id: 'all', name: 'All Prices' },
    { id: 'under-5000', name: 'Under ₹5,000', min: 0, max: 5000 },
    { id: '5000-15000', name: '₹5,000 - ₹15,000', min: 5000, max: 15000 },
    { id: '15000-30000', name: '₹15,000 - ₹30,000', min: 15000, max: 30000 },
    { id: '30000-plus', name: 'Over ₹30,000', min: 30000, max: Infinity },
  ];
  
  // Sort options
  const sortOptions = [
    { id: 'featured', name: 'Featured' },
    { id: 'price-low-to-high', name: 'Price: Low to High' },
    { id: 'price-high-to-low', name: 'Price: High to Low' },
    { id: 'newest', name: 'Newest' },
    { id: 'rating', name: 'Highest Rating' },
  ];
  
  // Apply filters and sorting
  useEffect(() => {
    let result = [...products];
    
    // Filter by category
    if (filters.category !== 'all') {
      result = result.filter(p => p.category === filters.category);
    }
    
    // Filter by price range
    if (filters.priceRange !== 'all') {
      const range = priceRanges.find(r => r.id === filters.priceRange);
      if (range && range.min !== undefined && range.max !== undefined) {
        result = result.filter(p => {
          // Check if any variant's price falls within the range
          return p.variants.some(v => v.price >= range.min! && v.price <= range.max!);
        });
      }
    }
    
    // Filter by color
    if (filters.color !== 'all') {
      result = result.filter(p => {
        return p.variants.some(v => v.color === filters.color);
      });
    }
    
    // Filter by size
    if (filters.size !== 'all') {
      result = result.filter(p => {
        return p.variants.some(v => v.size === filters.size);
      });
    }
    
    // Apply sorting
    switch (filters.sortBy) {
      case 'price-low-to-high':
        result.sort((a, b) => Math.min(...a.variants.map(v => v.price)) - Math.min(...b.variants.map(v => v.price)));
        break;
      case 'price-high-to-low':
        result.sort((a, b) => Math.max(...b.variants.map(v => v.price)) - Math.max(...a.variants.map(v => v.price)));
        break;
      case 'newest':
        // Sort by id (assuming newer products have newer IDs)
        result.sort((a, b) => a.id > b.id ? -1 : 1);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      default:
        // 'featured' - leave in default order
        break;
    }
    
    setFilteredProducts(result);
  }, [filters, products]);
  
  // Set initial category filter from URL params
  useEffect(() => {
    if (categoryParam) {
      setFilters(prev => ({ ...prev, category: categoryParam }));
    }
  }, [categoryParam]);

  // Inside your component, add this useEffect to fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log('Starting product fetch...');
        const fetchedProducts = await productAPI.getProducts();
        console.log(`Fetched ${fetchedProducts.length} products`);
        setProducts(fetchedProducts);
        setFilteredProducts(fetchedProducts);
      } catch (err: any) {
        console.error('Error loading products:', err);
        setError(err.message || 'Failed to load products');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProducts();
  }, []);
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await productAPI.getProducts();
        console.log(`Fetched ${data.length} products`);
        if (data.length === 0) {
          setError('No products found. Please try again later.');
        } else {
          setProducts(data);
          setFilteredProducts(data);
        }
      } catch (err: any) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);
  
  
  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {filters.category === 'all' ? 'All Products' : filters.category}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Browse our collection of high-quality cooling products
          </p>
        </div>
        
        {/* Mobile Filter Button */}
        <button 
          className="md:hidden bg-white dark:bg-gray-800 rounded-md shadow px-4 py-2 flex items-center text-gray-700 dark:text-gray-200 mb-4"
          onClick={() => setMobileFilterOpen(true)}
        >
          <FunnelIcon className="h-5 w-5 mr-2" />
          Filter & Sort
        </button>
        
        {/* Filter and Products Grid */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters - Desktop */}
          <div className="hidden md:block w-64 flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-md shadow p-5 sticky top-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center justify-between">
                <span>Filters</span>
                <button
                  onClick={() => setFilters({
                    category: 'all',
                    priceRange: 'all',
                    sortBy: 'featured',
                    color: 'all',
                    size: 'all'
                  })}
                  className="text-sm text-primary hover:text-primary-dark transition-colors"
                >
                  Reset All
                </button>
              </h3>
              
              {/* Sort By - Moved to top for better UX */}
              <div className="mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Sort By</h4>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                >
                  {sortOptions.map(option => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Category Filter */}
              <div className="mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Category</h4>
                <div className="space-y-2">
                  {categories.map(category => (
                    <div key={category} className="flex items-center">
                      <input
                        id={`category-${category}`}
                        type="radio"
                        checked={filters.category === category}
                        onChange={() => setFilters(prev => ({ ...prev, category }))}
                        className="h-4 w-4 text-primary focus:ring-primary-light"
                      />
                      <label htmlFor={`category-${category}`} className="ml-2 text-gray-600 dark:text-gray-300 hover:text-primary cursor-pointer">
                        {category === 'all' ? 'All Categories' : category}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Color Filter */}
              <div className="mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Color</h4>
                <div className="grid grid-cols-2 gap-2">
                  {availableColors.map(color => (
                    <div key={color} className="flex items-center">
                      <input
                        id={`color-${color}`}
                        type="radio"
                        checked={filters.color === color}
                        onChange={() => setFilters(prev => ({ ...prev, color }))}
                        className="h-4 w-4 text-primary focus:ring-primary-light"
                      />
                      <label htmlFor={`color-${color}`} className="ml-2 text-gray-600 dark:text-gray-300 hover:text-primary cursor-pointer flex items-center">
                        {color !== 'all' && (
                          <span 
                            className="inline-block w-4 h-4 mr-2 rounded-full border border-gray-300 dark:border-gray-600"
                            style={{ 
                              backgroundColor: color.toLowerCase(),
                              background: ['White', 'Silver', 'Gold'].includes(color) ? 
                                `linear-gradient(135deg, ${color.toLowerCase()}, #f9f9f9)` : color.toLowerCase()
                            }}
                          ></span>
                        )}
                        {color === 'all' ? 'All Colors' : color}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Size Filter */}
              <div className="mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Size</h4>
                <div className="grid grid-cols-2 gap-2">
                  {availableSizes.map(size => (
                    <div key={size} className="flex items-center">
                      <input
                        id={`size-${size}`}
                        type="radio"
                        checked={filters.size === size}
                        onChange={() => setFilters(prev => ({ ...prev, size }))}
                        className="h-4 w-4 text-primary focus:ring-primary-light"
                      />
                      <label htmlFor={`size-${size}`} className="ml-2 text-gray-600 dark:text-gray-300 hover:text-primary cursor-pointer">
                        {size === 'all' ? 'All Sizes' : size}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Price Range Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Price Range</h4>
                <div className="space-y-2">
                  {priceRanges.map(range => (
                    <div key={range.id} className="flex items-center">
                      <input
                        id={`price-${range.id}`}
                        type="radio"
                        checked={filters.priceRange === range.id}
                        onChange={() => setFilters(prev => ({ ...prev, priceRange: range.id }))}
                        className="h-4 w-4 text-primary focus:ring-primary-light"
                      />
                      <label htmlFor={`price-${range.id}`} className="ml-2 text-gray-600 dark:text-gray-300 hover:text-primary cursor-pointer">
                        {range.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Products Grid */}
          <div className="flex-1">
            {/* Active Filters */}
            {(filters.category !== 'all' || filters.color !== 'all' || filters.size !== 'all' || filters.priceRange !== 'all') && (
              <div className="mb-4 flex flex-wrap gap-2">
                {filters.category !== 'all' && (
                  <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full flex items-center text-sm">
                    Category: {filters.category}
                    <button className="ml-1" onClick={() => setFilters(prev => ({ ...prev, category: 'all' }))}>
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}
                {filters.color !== 'all' && (
                  <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full flex items-center text-sm">
                    Color: {filters.color}
                    <button className="ml-1" onClick={() => setFilters(prev => ({ ...prev, color: 'all' }))}>
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}
                {filters.size !== 'all' && (
                  <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full flex items-center text-sm">
                    Size: {filters.size}
                    <button className="ml-1" onClick={() => setFilters(prev => ({ ...prev, size: 'all' }))}>
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}
                {filters.priceRange !== 'all' && (
                  <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full flex items-center text-sm">
                    Price: {priceRanges.find(r => r.id === filters.priceRange)?.name}
                    <button className="ml-1" onClick={() => setFilters(prev => ({ ...prev, priceRange: 'all' }))}>
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* Results Count and Sort (for desktop) */}
            <div className="hidden md:flex justify-between items-center mb-4">
              <p className="text-gray-600 dark:text-gray-300">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'result' : 'results'} found
              </p>
            </div>
            
            {/* Loading State */}
            {isLoading && (
              <div className="flex flex-col justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-300">Loading products...</p>
              </div>
            )}
            
            {/* Error State */}
            {error && (
              <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow">
                <h3 className="text-lg font-medium text-red-600 dark:text-red-400 mb-2">Error</h3>
                <p className="text-gray-600 dark:text-gray-300">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}
            
            {/* Empty Results */}
            {!isLoading && !error && filteredProducts.length === 0 && (
              <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No products found</h3>
                <p className="text-gray-600 dark:text-gray-300">Try changing your filters</p>
                <button
                  onClick={() => setFilters({
                    category: 'all',
                    priceRange: 'all',
                    sortBy: 'featured',
                    color: 'all',
                    size: 'all'
                  })}
                  className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            )}
            
            {/* Products Grid */}
            {!isLoading && !error && filteredProducts.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Mobile Filters */}
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-40 bg-black bg-opacity-25 flex md:hidden">
            <div className="bg-white dark:bg-gray-800 w-4/5 max-w-md h-full overflow-y-auto ml-auto p-5">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Filters</h3>
                <button onClick={() => setMobileFilterOpen(false)}>
                  <XMarkIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              
              {/* Category Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Category</h4>
                <div className="space-y-2">
                  {categories.map(category => (
                    <div key={category} className="flex items-center">
                      <input
                        id={`mobile-category-${category}`}
                        type="radio"
                        checked={filters.category === category}
                        onChange={() => setFilters(prev => ({ ...prev, category }))}
                        className="h-4 w-4 text-primary focus:ring-primary-light"
                      />
                      <label htmlFor={`mobile-category-${category}`} className="ml-2 text-gray-600 dark:text-gray-300">
                        {category === 'all' ? 'All Categories' : category}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Color Filter - Mobile */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Color</h4>
                <div className="space-y-2">
                  {availableColors.map(color => (
                    <div key={color} className="flex items-center">
                      <input
                        id={`mobile-color-${color}`}
                        type="radio"
                        checked={filters.color === color}
                        onChange={() => setFilters(prev => ({ ...prev, color }))}
                        className="h-4 w-4 text-primary focus:ring-primary-light"
                      />
                      <label htmlFor={`mobile-color-${color}`} className="ml-2 text-gray-600 dark:text-gray-300 flex items-center">
                        {color !== 'all' && (
                          <span 
                            className="inline-block w-4 h-4 mr-2 rounded-full border border-gray-300 dark:border-gray-600"
                            style={{ 
                              backgroundColor: color.toLowerCase(),
                              background: ['White', 'Silver', 'Gold'].includes(color) ? 
                                `linear-gradient(135deg, ${color.toLowerCase()}, #f9f9f9)` : color.toLowerCase()
                            }}
                          ></span>
                        )}
                        {color === 'all' ? 'All Colors' : color}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Size Filter - Mobile */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Size</h4>
                <div className="space-y-2">
                  {availableSizes.map(size => (
                    <div key={size} className="flex items-center">
                      <input
                        id={`mobile-size-${size}`}
                        type="radio"
                        checked={filters.size === size}
                        onChange={() => setFilters(prev => ({ ...prev, size }))}
                        className="h-4 w-4 text-primary focus:ring-primary-light"
                      />
                      <label htmlFor={`mobile-size-${size}`} className="ml-2 text-gray-600 dark:text-gray-300">
                        {size === 'all' ? 'All Sizes' : size}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Price Range Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Price Range</h4>
                <div className="space-y-2">
                  {priceRanges.map(range => (
                    <div key={range.id} className="flex items-center">
                      <input
                        id={`mobile-price-${range.id}`}
                        type="radio"
                        checked={filters.priceRange === range.id}
                        onChange={() => setFilters(prev => ({ ...prev, priceRange: range.id }))}
                        className="h-4 w-4 text-primary focus:ring-primary-light"
                      />
                      <label htmlFor={`mobile-price-${range.id}`} className="ml-2 text-gray-600 dark:text-gray-300">
                        {range.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Sort By */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Sort By</h4>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                >
                  {sortOptions.map(option => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Button Group */}
              <div className="flex flex-col gap-2">
                {/* Apply Filters Button */}
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary-dark transition-colors"
                >
                  Apply Filters
                </button>
                
                {/* Clear Filters Button */}
                <button
                  onClick={() => {
                    setFilters({
                      category: 'all',
                      priceRange: 'all',
                      sortBy: 'featured',
                      color: 'all',
                      size: 'all'
                    });
                    setMobileFilterOpen(false);
                  }}
                  className="w-full py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

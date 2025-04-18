import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { productAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const productsData = await productAPI.getProducts();
        
        // Extract unique categories
        const uniqueCategories = [...new Set(productsData.map(p => p.category))];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setIsProductsLoading(true);
        setError(null);
        // Get featured products from the API
        const featured = await productAPI.getFeaturedProducts();
        
        if (featured.length === 0) {
          setError("No featured products found.");
        } else {
          setFeaturedProducts(featured);
        }
      } catch (err: any) {
        console.error('Error fetching featured products:', err);
        setError(err.message || 'Failed to load featured products');
      } finally {
        setIsProductsLoading(false);
      }
    };
    
    fetchFeaturedProducts();
  }, []);
  
  // Helper function to get category images
  const getCategoryImage = (category: string) => {
    // Map categories to specific images
    const categoryImageMap: Record<string, string> = {
      'Air Conditioner': 'https://i.imgur.com/8yUf7UL.jpg',
      'Ceiling Fan': 'https://i.imgur.com/NKDdASM.jpg',
      'Tower Fan': 'https://i.imgur.com/vL9UhWe.jpg',
      'Table Fan': 'https://i.imgur.com/RAU7Z6f.jpg',
    };
    
    // Return the specific image or default to the inverter AC image
    return categoryImageMap[category] || 'https://i.imgur.com/sn4ofDi.jpg';
  };

  return (
    <div className="bg-white dark:bg-gray-900 w-full">
      {/* Hero section */}
      <section className="bg-gradient-to-r from-primary to-blue-600 dark:from-primary-dark dark:to-blue-800 text-white py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Stay Cool with CoolGarmi</h1>
              <p className="text-base sm:text-lg mb-6 sm:mb-8">
                Premium cooling solutions for homes and offices. Find the perfect air conditioner or fan to beat the heat!
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/products" className="bg-white text-primary dark:bg-gray-800 dark:text-primary-light font-medium px-4 sm:px-6 py-2 sm:py-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  Shop Now
                </Link>
                <Link to="/products?category=Ceiling Fan" className="bg-transparent border-2 border-white text-white font-medium px-4 sm:px-6 py-2 sm:py-3 rounded-md hover:bg-white hover:text-primary dark:hover:bg-gray-800 dark:hover:text-primary-light transition-colors">
                  Fans
                </Link>
                <Link to="/products?category=Air Conditioner" className="bg-transparent border-2 border-white text-white font-medium px-4 sm:px-6 py-2 sm:py-3 rounded-md hover:bg-white hover:text-primary dark:hover:bg-gray-800 dark:hover:text-primary-light transition-colors">
                  AC
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <img 
                src="https://i.imgur.com/8yUf7UL.jpg" 
                alt="Air Conditioner"
                className="rounded-lg shadow-lg max-w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Categories section */}
      <section className="py-10 sm:py-12 bg-gray-50 dark:bg-gray-800 w-full">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-10 text-gray-900 dark:text-white">Shop by Category</h2>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {categories.map((category, index) => (
                <Link 
                  key={index}
                  to={`/products?category=${encodeURIComponent(category)}`}
                  className="relative overflow-hidden rounded-lg group"
                >
                  <div className="aspect-w-1 aspect-h-1 bg-gray-200 dark:bg-gray-700 h-48 sm:h-64">
                    <img
                      src={getCategoryImage(category)}
                      alt={category}
                      className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                    <h3 className="text-white text-lg sm:text-xl font-semibold p-4 sm:p-6">{category}</h3>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
      
      {/* Featured Products section */}
      <section className="py-10 sm:py-12 dark:bg-gray-900 w-full">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Featured Products</h2>
            <Link to="/products" className="text-primary dark:text-primary-light hover:text-primary-dark dark:hover:text-primary font-medium">
              View All →
            </Link>
          </div>
          {isProductsLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
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
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 dark:text-gray-400">No featured products available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
      
      {/* Features section */}
      <section className="py-10 sm:py-12 bg-gray-50 dark:bg-gray-800 w-full">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-10 text-gray-900 dark:text-white">Why Choose CoolGarmi?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center p-4 sm:p-6 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
              <div className="bg-primary-light dark:bg-primary-dark/30 rounded-full w-12 h-12 sm:w-16 sm:h-16 mx-auto flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 text-primary dark:text-primary-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900 dark:text-white">Premium Quality</h3>
              <p className="text-gray-600 dark:text-gray-300">
                We offer only the highest quality cooling products from trusted brands.
              </p>
            </div>
            
            <div className="text-center p-4 sm:p-6 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
              <div className="bg-primary-light dark:bg-primary-dark/30 rounded-full w-12 h-12 sm:w-16 sm:h-16 mx-auto flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 text-primary dark:text-primary-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900 dark:text-white">Fast Delivery</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Get your cooling solutions delivered quickly to your doorstep.
              </p>
            </div>
            
            <div className="text-center p-4 sm:p-6 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
              <div className="bg-primary-light dark:bg-primary-dark/30 rounded-full w-12 h-12 sm:w-16 sm:h-16 mx-auto flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 text-primary dark:text-primary-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900 dark:text-white">24/7 Support</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Our customer service team is always available to assist you.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA section */}
      <section className="py-12 sm:py-16 bg-primary dark:bg-primary-dark w-full">
        <div className="container mx-auto px-4 sm:px-6 text-center text-white">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to Beat the Heat?</h2>
          <p className="text-base sm:text-lg mb-6 sm:mb-8 max-w-xl mx-auto">
            Browse our collection of premium cooling products and find the perfect solution for your space.
          </p>
          <Link to="/products" className="bg-white text-primary dark:bg-gray-800 dark:text-primary-light font-medium px-6 py-2 sm:px-8 sm:py-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors inline-block">
            Shop Now
          </Link>
        </div>
      </section>
    </div>
  );
}

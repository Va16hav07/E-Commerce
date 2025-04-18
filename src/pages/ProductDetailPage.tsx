import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline';
import { ShoppingCartIcon, ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { Product } from '../types';
import { productAPI } from '../services/api';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  // Use state for products
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImage, setCurrentImage] = useState('');
  
  // Add state for notification
  const [showNotification, setShowNotification] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  // Fetch product data when component mounts or id changes
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        console.log(`Fetching product details for ID: ${id}`);
        const productData = await productAPI.getProductById(id);
        
        if (!productData) {
          console.error('Product not found or returned null');
          setError('Product not found');
          setIsLoading(false);
          return;
        }
        
        console.log('Product data loaded:', productData);
        setProduct(productData);
        
        // Set default image
        if (productData.imageUrl) {
          setCurrentImage(productData.imageUrl);
        }
        
        // If product has variants, select the first color by default
        if (productData.variants && productData.variants.length > 0) {
          const colors = [...new Set(productData.variants.map(v => v.color))];
          if (colors.length > 0) {
            setSelectedColor(colors[0]);
            
            // Also select first available size for this color
            const sizes = [...new Set(productData.variants
              .filter(v => v.color === colors[0])
              .map(v => v.size))];
              
            if (sizes.length > 0) {
              setSelectedSize(sizes[0]);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProduct();
  }, [id]);
  
  // Get available colors and sizes
  const availableColors = product ? [...new Set(product.variants.map(v => v.color))] : [];
  const availableSizes = product && selectedColor 
    ? [...new Set(product.variants.filter(v => v.color === selectedColor).map(v => v.size))] 
    : [];
  
  // Get current variant information
  const currentVariant = product && selectedColor && selectedSize 
    ? product.variants.find(v => v.color === selectedColor && v.size === selectedSize) 
    : null;
  
  // Reset size when color changes
  useEffect(() => {
    if (selectedColor && product) {
      const sizes = [...new Set(product.variants.filter(v => v.color === selectedColor).map(v => v.size))];
      if (sizes.length > 0) {
        setSelectedSize(sizes[0]);
      } else {
        setSelectedSize(null);
      }
    }
  }, [selectedColor, product]);
  
  // Function to render rating stars
  const renderRating = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<StarIcon key={`full-${i}`} className="h-5 w-5 text-yellow-400" />);
    }
    
    // Half star
    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <StarIconOutline className="h-5 w-5 text-yellow-400" />
          <div className="absolute top-0 left-0 overflow-hidden w-1/2">
            <StarIcon className="h-5 w-5 text-yellow-400" />
          </div>
        </div>
      );
    }
    
    // Empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<StarIconOutline key={`empty-${i}`} className="h-5 w-5 text-yellow-400" />);
    }
    
    return stars;
  };
  
  const handleAddToCart = () => {
    if (product && selectedColor && selectedSize) {
      setIsAddingToCart(true);
      
      // Simulate a short delay for better UX
      setTimeout(() => {
        addToCart(product, selectedColor, selectedSize, quantity);
        setIsAddingToCart(false);
        setShowNotification(true);
        
        // Hide notification after 3 seconds
        setTimeout(() => {
          setShowNotification(false);
        }, 3000);
      }, 300);
    }
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading product details...</span>
      </div>
    );
  }
  
  // Show error or product not found
  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{error || 'Product not found'}</h2>
          <button 
            onClick={() => navigate('/products')}
            className="mt-4 text-primary dark:text-primary-light hover:text-primary-dark dark:hover:text-primary-light/80"
          >
            Browse all products
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Notification */}
      {showNotification && (
        <div className="fixed top-4 right-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 shadow-lg rounded-md p-4 flex items-start max-w-sm z-50 animate-fade-in">
          <CheckCircleIcon className="h-6 w-6 text-green-500 dark:text-green-400 mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-green-800 dark:text-green-300">Added to cart!</h3>
            <p className="text-sm text-green-700 dark:text-green-400 mt-1">
              {quantity} {quantity > 1 ? 'items' : 'item'} added to your cart
            </p>
          </div>
        </div>
      )}
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center mb-8 text-sm">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back
          </button>
          <span className="mx-2 text-gray-500 dark:text-gray-400">|</span>
          <a href="/" className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light">Home</a>
          <span className="mx-2 text-gray-500 dark:text-gray-400">/</span>
          <a href="/products" className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light">Products</a>
          <span className="mx-2 text-gray-500 dark:text-gray-400">/</span>
          <span className="text-gray-800 dark:text-gray-200">{product.name}</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-4 aspect-square">
              <img 
                src={currentImage} 
                alt={product.name} 
                className="w-full h-full object-contain p-4"
              />
            </div>
            
            {/* Additional images would go here in a real product */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                className="w-20 h-20 border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-light"
                onClick={() => setCurrentImage(product.imageUrl)}
              >
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </button>
              
              {/* Sample additional images (in a real app, these would be different angles) */}
              <button
                className="w-20 h-20 border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-light"
                onClick={() => setCurrentImage(`https://source.unsplash.com/random/400x400/?${encodeURIComponent(product.category.toLowerCase())}`)}
              >
                <img
                  src={`https://source.unsplash.com/random/400x400/?${encodeURIComponent(product.category.toLowerCase())}`}
                  alt={`${product.name} alt view`}
                  className="w-full h-full object-cover"
                />
              </button>
              <button
                className="w-20 h-20 border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-light"
                onClick={() => setCurrentImage(`https://source.unsplash.com/random/400x401/?${encodeURIComponent(product.category.toLowerCase())}`)}
              >
                <img
                  src={`https://source.unsplash.com/random/400x401/?${encodeURIComponent(product.category.toLowerCase())}`}
                  alt={`${product.name} alt view`}
                  className="w-full h-full object-cover"
                />
              </button>
            </div>
          </div>
          
          {/* Product Details */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{product.name}</h1>
            <div className="flex items-center mb-4">
              <div className="flex">
                {renderRating(product.rating)}
              </div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">({product.rating})</span>
            </div>
            
            <div className="mb-6">
              {currentVariant ? (
                <span className="text-2xl font-bold text-gray-900 dark:text-white">₹{currentVariant.price.toLocaleString()}</span>
              ) : (
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  ₹{Math.min(...product.variants.map(v => v.price)).toLocaleString()} - 
                  ₹{Math.max(...product.variants.map(v => v.price)).toLocaleString()}
                </span>
              )}
              {currentVariant && currentVariant.stock > 0 ? (
                <span className="ml-2 text-green-600 dark:text-green-500 font-medium">In Stock</span>
              ) : (
                <span className="ml-2 text-red-600 dark:text-red-500 font-medium">Out of Stock</span>
              )}
            </div>
            
            {/* Rest of the component remains the same */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <p className="text-gray-700 dark:text-gray-300 mb-6">{product.description}</p>
              
              {/* Color Selection */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Color: {selectedColor}</h3>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-full focus:outline-none ${
                        selectedColor === color ? 'ring-2 ring-offset-2 ring-primary dark:ring-primary-light dark:ring-offset-gray-900' : 'ring-1 ring-gray-300 dark:ring-gray-600'
                      }`}
                    >
                      <span
                        className="block w-full h-full rounded-full"
                        style={{ 
                          backgroundColor: color.toLowerCase(),
                          background: ['White', 'Silver', 'Gold'].includes(color) ? 
                            `linear-gradient(135deg, ${color.toLowerCase()}, #f9f9f9)` : color.toLowerCase()
                        }}
                        title={color}
                      ></span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Size Selection */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Size: {selectedSize}</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {availableSizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-2 border rounded-md focus:outline-none ${
                        selectedSize === size 
                        ? 'border-primary bg-primary-light text-primary dark:border-primary-light dark:bg-primary-dark/30 dark:text-primary-light font-medium' 
                        : 'border-gray-300 dark:border-gray-600 hover:border-primary dark:hover:border-primary-light dark:text-gray-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Quantity */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Quantity</h3>
                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md w-max">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 text-lg dark:text-gray-300"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-4 py-1 border-l border-r border-gray-300 dark:border-gray-600 dark:text-gray-300">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1 text-lg dark:text-gray-300"
                  >
                    +
                  </button>
                </div>
              </div>
              
              {/* Add to Cart */}
              <div className="flex gap-4 mb-6">
                <button
                  onClick={handleAddToCart}
                  disabled={!selectedColor || !selectedSize || isAddingToCart}
                  className={`flex items-center justify-center px-6 py-3 rounded-md font-medium ${
                    selectedColor && selectedSize && !isAddingToCart
                    ? 'bg-primary text-white hover:bg-primary-dark dark:bg-primary-dark dark:hover:bg-primary-dark/80'
                    : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  } flex-1`}
                >
                  {isAddingToCart ? (
                    <>
                      <span className="inline-block h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingCartIcon className="h-5 w-5 mr-2" />
                      Add to Cart
                    </>
                  )}
                </button>
              </div>
              
              {/* Product Info */}
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Product Information</h3>
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-t border-gray-200 dark:border-gray-700">
                      <td className="py-2 text-gray-600 dark:text-gray-400">Category</td>
                      <td className="py-2 font-medium text-gray-900 dark:text-gray-200">{product.category}</td>
                    </tr>
                    {currentVariant && (
                      <>
                        <tr className="border-t border-gray-200 dark:border-gray-700">
                          <td className="py-2 text-gray-600 dark:text-gray-400">SKU</td>
                          <td className="py-2 font-medium text-gray-900 dark:text-gray-200">{`SK-${product.id}-${selectedColor?.substring(0,2).toUpperCase()}-${selectedSize?.replace(/\s+/g, '')}`}</td>
                        </tr>
                        <tr className="border-t border-gray-200 dark:border-gray-700">
                          <td className="py-2 text-gray-600 dark:text-gray-400">Availability</td>
                          <td className="py-2 font-medium text-green-600 dark:text-green-500">In Stock ({currentVariant.stock} units)</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

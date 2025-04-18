import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline';
import { ShoppingCartIcon, BoltIcon } from '@heroicons/react/24/solid';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showAddedMessage, setShowAddedMessage] = useState(false);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const prices = product.variants.map(variant => variant.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  
  // Get available colors (unique)
  const colors = [...new Set(product.variants.map(variant => variant.color))];
  
  // Get available sizes (unique)
  const sizes = [...new Set(product.variants.map(variant => variant.size))];
  
  // Select default color and size for quick add
  const defaultColor = product.variants.length > 0 ? product.variants[0].color : null;
  const defaultSize = product.variants.length > 0 ? product.variants[0].size : null;
  
  // Function to render rating stars
  const renderRating = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<StarIcon key={`full-${i}`} className="h-4 w-4 text-yellow-400" />);
    }
    
    // Half star
    if (hasHalfStar) {
      stars.push(<StarIcon key="half" className="h-4 w-4 text-yellow-400" />);
    }
    
    // Empty stars
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<StarIconOutline key={`empty-${i}`} className="h-4 w-4 text-yellow-400" />);
    }
    
    return stars;
  };
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAddingToCart(true);
    
    // Simulate network request
    setTimeout(() => {
      try {
        if (defaultColor && defaultSize) {
          addToCart(product, defaultColor, defaultSize, 1);
          
          // Show "Added" message for 2 seconds
          setShowAddedMessage(true);
          setTimeout(() => {
            setShowAddedMessage(false);
          }, 2000);
        } else {
          // If no default variant, navigate to product detail
          navigate(`/product/${product.id}`);
        }
      } catch (error) {
        console.error('Error updating cart:', error);
      } finally {
        setIsAddingToCart(false);
      }
    }, 600);
  };
  
  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAddingToCart(true);
    
    setTimeout(() => {
      try {
        if (defaultColor && defaultSize) {
          addToCart(product, defaultColor, defaultSize, 1);
          navigate('/checkout');
        } else {
          // If no default variant, navigate to product detail
          navigate(`/product/${product.id}`);
        }
      } catch (error) {
        console.error('Error in buy now process:', error);
      } finally {
        setIsAddingToCart(false);
      }
    }, 300);
  };
  
  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02] duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/product/${product.id}`}>
        <div className="h-48 overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover object-center transition-transform duration-500 ease-in-out"
            style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
          />
        </div>
      </Link>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-gray-900 dark:text-white mb-1 text-lg">
            <Link to={`/product/${product.id}`}>{product.name}</Link>
          </h3>
        </div>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          {product.category}
        </p>
        
        <div className="flex items-center mb-2">
          {renderRating(product.rating)}
          <span className="text-xs text-gray-500 ml-1">({product.rating})</span>
        </div>
        
        <div className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {minPrice === maxPrice ? (
            <>₹{minPrice.toLocaleString()}</>
          ) : (
            <>₹{minPrice.toLocaleString()} - ₹{maxPrice.toLocaleString()}</>
          )}
        </div>
        
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center">
            <span className="text-xs text-gray-600 dark:text-gray-400 mr-2">Colors:</span>
            <div className="flex space-x-1">
              {colors.slice(0, 3).map((color) => (
                <span
                  key={color}
                  className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600"
                  style={{ 
                    backgroundColor: color.toLowerCase(),
                    background: ['White', 'Silver', 'Gold'].includes(color) ? 
                      `linear-gradient(135deg, ${color.toLowerCase()}, #f9f9f9)` : color.toLowerCase()
                  }}
                  title={color}
                ></span>
              ))}
              {colors.length > 3 && (
                <span className="text-xs text-gray-500">+{colors.length - 3}</span>
              )}
            </div>
          </div>
          
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {sizes.length > 0 && (
              <span>{sizes.length} {sizes.length === 1 ? 'size' : 'sizes'}</span>
            )}
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button 
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            className={`flex-1 border py-2 rounded text-sm font-medium flex items-center justify-center transition-colors ${
              showAddedMessage 
                ? "bg-green-500 text-white border-green-500"
                : "bg-white dark:bg-gray-700 border-primary text-primary dark:text-white hover:bg-primary-light hover:text-white"
            }`}
          >
            {isAddingToCart ? (
              <span className="inline-block h-4 w-4 border-2 border-primary dark:border-white border-t-transparent rounded-full animate-spin mr-1"></span>
            ) : showAddedMessage ? (
              "Added ✓"
            ) : (
              <>
                <ShoppingCartIcon className="h-4 w-4 mr-1" />
                Add to Cart
              </>
            )}
          </button>
          <button 
            onClick={handleBuyNow}
            disabled={isAddingToCart}
            className="flex-1 bg-primary text-white hover:bg-primary-dark transition-colors py-2 rounded text-sm font-medium flex items-center justify-center"
          >
            {isAddingToCart ? (
              <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></span>
            ) : (
              <>
                <BoltIcon className="h-4 w-4 mr-1" />
                Buy Now
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

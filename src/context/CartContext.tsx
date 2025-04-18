import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Product } from '../types';

// Define cart item type
export interface CartItem {
  product: Product;
  selectedColor: string;
  selectedSize: string;
  quantity: number;
}

// Define cart state
interface CartState {
  items: CartItem[];
}

type CartAction = 
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'REMOVE_FROM_CART'; payload: { productId: string, color: string, size: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string, color: string, size: string, quantity: number } }
  | { type: 'CLEAR_CART' };

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, color: string, size: string, quantity: number) => void;
  removeFromCart: (productId: string, color: string, size: string) => void;
  updateQuantity: (productId: string, color: string, size: string, quantity: number) => void;
  clearCart: () => void;
  totalAmount: number;
  totalItems: number;
}

// Create context with default values
const CartContext = createContext<CartContextType | undefined>(undefined);

// Initial state
const initialState: CartState = {
  items: [],
};

// Reducer function
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const { product, selectedColor, selectedSize, quantity } = action.payload;
      
      // Ensure state.items exists before using findIndex
      const items = state.items || [];
      
      // Check if the item already exists in cart
      const existingItemIndex = items.findIndex(
        (item) => item.product.id === product.id && item.selectedColor === selectedColor && item.selectedSize === selectedSize
      );
      
      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        const updatedItems = [...items];
        updatedItems[existingItemIndex].quantity += quantity;
        
        return {
          ...state,
          items: updatedItems,
        };
      }
      
      // Add new item to cart
      return {
        ...state,
        items: [...items, action.payload],
      };
    }
    
    case 'REMOVE_FROM_CART': {
      const { productId, color, size } = action.payload;
      
      // Ensure state.items exists
      const items = state.items || [];
      
      return {
        ...state,
        items: items.filter(
          (item) => !(item.product.id === productId && item.selectedColor === color && item.selectedSize === size)
        ),
      };
    }
    
    case 'UPDATE_QUANTITY': {
      const { productId, color, size, quantity } = action.payload;
      
      // Ensure state.items exists
      const items = state.items || [];
      
      // If quantity is 0 or negative, remove the item
      if (quantity <= 0) {
        return {
          ...state,
          items: items.filter(
            (item) => !(item.product.id === productId && item.selectedColor === color && item.selectedSize === size)
          ),
        };
      }
      
      // Otherwise update the quantity
      return {
        ...state,
        items: items.map((item) =>
          item.product.id === productId && item.selectedColor === color && item.selectedSize === size
            ? { ...item, quantity }
            : item
        ),
      };
    }
    
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
      };
      
    default:
      return state;
  }
}

// Provider component
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load cart from localStorage if available, with careful error handling
  let parsedCart = initialState;
  try {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const parsed = JSON.parse(savedCart);
      // Validate that parsed data has the expected structure
      if (parsed && typeof parsed === 'object' && Array.isArray(parsed.items)) {
        parsedCart = parsed;
      } else {
        // If not valid, use initial state and clear localStorage
        console.warn('Invalid cart data in localStorage, resetting');
        localStorage.removeItem('cart');
      }
    }
  } catch (e) {
    console.error('Error parsing cart from localStorage:', e);
    // Clear potentially corrupted data
    localStorage.removeItem('cart');
  }
  
  const [cartState, dispatch] = useReducer(cartReducer, parsedCart);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cartState));
    } catch (e) {
      console.error('Error saving cart to localStorage:', e);
    }
  }, [cartState]);
  
  // Add item to cart
  const addToCart = (product: Product, color: string, size: string, quantity: number) => {
    dispatch({
      type: 'ADD_TO_CART',
      payload: { product, selectedColor: color, selectedSize: size, quantity },
    });
  };
  
  // Remove item from cart
  const removeFromCart = (productId: string, color: string, size: string) => {
    dispatch({
      type: 'REMOVE_FROM_CART',
      payload: { productId, color, size },
    });
  };
  
  // Update item quantity
  const updateQuantity = (productId: string, color: string, size: string, quantity: number) => {
    dispatch({
      type: 'UPDATE_QUANTITY',
      payload: { productId, color, size, quantity },
    });
  };
  
  // Clear cart
  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };
  
  // Calculate total price
  const totalAmount = cartState.items.reduce((total, item) => {
    // Find the specific variant's price
    const variant = item.product.variants.find(
      v => v.color === item.selectedColor && v.size === item.selectedSize
    );
    const price = variant ? variant.price : item.product.basePrice;
    return total + price * item.quantity;
  }, 0);
  
  // Get total items count
  const totalItems = cartState.items.reduce((count, item) => count + item.quantity, 0);
  
  return (
    <CartContext.Provider
      value={{
        cart: cartState.items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalAmount,
        totalItems
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use the cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

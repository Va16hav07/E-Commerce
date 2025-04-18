import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { TrashIcon, MinusIcon, PlusIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, totalAmount } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Mock shipping fee
  const shippingFee = totalAmount > 0 ? (totalAmount > 10000 ? 0 : 99) : 0;
  
  const handleQuantityChange = (productId: string, color: string, size: string, newQuantity: number) => {
    if (newQuantity >= 1) {
      updateQuantity(productId, color, size, newQuantity);
    }
  };
  
  const handleCheckout = () => {
    if (currentUser) {
      navigate('/checkout');
    } else {
      navigate('/login', { state: { from: '/checkout', message: 'Please login to continue with checkout' } });
    }
  };
  
  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Your Shopping Cart</h1>
        
        {cart.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <div className="flex justify-center mb-4">
              <ShoppingBagIcon className="h-16 w-16 text-gray-300 dark:text-gray-600" />
            </div>
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Your cart is empty</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Looks like you haven't added any products to your cart yet.</p>
            <Link
              to="/products"
              className="bg-primary dark:bg-primary-dark text-white font-medium px-6 py-3 rounded-md hover:bg-primary-dark dark:hover:bg-primary-dark/90 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="py-4 px-6 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Product</th>
                      <th className="py-4 px-6 text-center text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quantity</th>
                      <th className="py-4 px-6 text-right text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Price</th>
                      <th className="py-4 px-6 text-right text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {cart.map((item, index) => {
                      // Find the selected variant
                      const variant = item.product.variants.find(
                        v => v.color === item.selectedColor && v.size === item.selectedSize
                      );
                      const price = variant ? variant.price : item.product.basePrice;
                      
                      return (
                        <tr key={index} className="dark:bg-gray-800">
                          <td className="py-4 px-6">
                            <div className="flex items-center">
                              <img
                                src={item.product.imageUrl}
                                alt={item.product.name}
                                className="h-16 w-16 object-cover rounded-md"
                              />
                              <div className="ml-4">
                                <h3 className="font-medium text-gray-900 dark:text-white">{item.product.name}</h3>
                                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                  <span>Color: {item.selectedColor}</span>
                                  <span className="mx-2">|</span>
                                  <span>Size: {item.selectedSize}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex justify-center items-center border border-gray-300 dark:border-gray-600 rounded-md w-24 mx-auto">
                              <button
                                onClick={() => handleQuantityChange(item.product.id, item.selectedColor, item.selectedSize, item.quantity - 1)}
                                className="px-2 py-1 text-gray-500 dark:text-gray-400"
                              >
                                <MinusIcon className="h-4 w-4" />
                              </button>
                              <span className="px-2 py-1 dark:text-white">{item.quantity}</span>
                              <button
                                onClick={() => handleQuantityChange(item.product.id, item.selectedColor, item.selectedSize, item.quantity + 1)}
                                className="px-2 py-1 text-gray-500 dark:text-gray-400"
                              >
                                <PlusIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right font-medium text-gray-900 dark:text-white">
                            ₹{(price * item.quantity).toLocaleString()}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button
                              onClick={() => removeFromCart(item.product.id, item.selectedColor, item.selectedSize)}
                              className="text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Order Summary */}
            <div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span className="font-medium text-gray-900 dark:text-white">₹{totalAmount.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {shippingFee > 0 ? `₹${shippingFee}` : 'Free'}
                    </span>
                  </div>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-between">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      ₹{(totalAmount + shippingFee).toLocaleString()}
                    </span>
                  </div>
                </div>
                
                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  className="mt-6 bg-primary dark:bg-primary-dark text-white font-medium px-6 py-3 rounded-md hover:bg-primary-dark dark:hover:bg-primary-dark/90 transition-colors w-full"
                >
                  Proceed to Checkout
                </button>
                
                {/* Continue Shopping Link */}
                <Link
                  to="/products"
                  className="mt-4 text-primary dark:text-primary-light hover:text-primary-dark dark:hover:text-primary-light/90 font-medium text-sm flex justify-center"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

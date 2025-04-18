import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CreditCardIcon, TruckIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { orderAPI } from '../services/api';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, totalAmount, clearCart } = useCart();
  const { currentUser } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'card',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Redirect to cart if cart is empty
  useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);
  
  // Calculate order total
  const shippingFee = totalAmount > 10000 ? 0 : 99;
  const tax = Math.round(totalAmount * 0.18); // 18% tax
  const orderTotal = totalAmount + shippingFee + tax;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);
    
    // Create full address string
    const fullAddress = `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`;
    
    try {
      console.log("Payment method selected:", formData.paymentMethod);
      
      // Prepare order data with complete variant information
      const orderData = {
        items: cart.map(item => {
          // Find the specific variant
          const variant = item.product.variants.find(
            v => v.color === item.selectedColor && v.size === item.selectedSize
          );
          
          return {
            productId: item.product.id,
            productName: item.product.name,
            color: item.selectedColor,
            size: item.selectedSize,
            price: variant ? variant.price : item.product.basePrice,
            quantity: item.quantity,
            // Include image for order history display
            imageUrl: item.product.imageUrl
          };
        }),
        customerAddress: fullAddress,
        customerPhone: formData.phone,
        // Convert payment method to uppercase to match backend enum
        paymentMethod: formData.paymentMethod.toUpperCase()
      };
      
      console.log("Sending order data:", orderData);
      
      // Create order through API
      const orderResponse = await orderAPI.createOrder(orderData);
      
      // Clear cart after successful order
      clearCart();
      
      // Navigate to success page with order details
      navigate('/order-success', { 
        state: { 
          orderNumber: orderResponse._id || orderResponse.id,
          orderAmount: orderTotal 
        } 
      });
    } catch (err: any) {
      console.error('Error during checkout:', err);
      
      // Show more specific error message
      if (err.response?.data?.error) {
        setError(`Order validation failed: ${err.response.data.error}`);
      } else {
        setError(err.response?.data?.message || 'An error occurred during checkout. Please try again.');
      }
      
      setIsProcessing(false);
    }
  };
  
  if (cart.length === 0) {
    return null; // Already handled by useEffect - will redirect to cart
  }
  
  return (
    <div className="bg-gray-50 dark:bg-gray-900 w-full">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">Checkout</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              {/* Shipping Information */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6">
                <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Shipping Information</h2>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-primary dark:focus:ring-primary-light focus:border-primary dark:focus:border-primary-light dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-primary dark:focus:ring-primary-light focus:border-primary dark:focus:border-primary-light dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-primary dark:focus:ring-primary-light focus:border-primary dark:focus:border-primary-light dark:text-white"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Address
                      </label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-primary dark:focus:ring-primary-light focus:border-primary dark:focus:border-primary-light dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-primary dark:focus:ring-primary-light focus:border-primary dark:focus:border-primary-light dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        State
                      </label>
                      <select
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleSelectChange}
                        required
                        className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-primary dark:focus:ring-primary-light focus:border-primary dark:focus:border-primary-light dark:text-white"
                      >
                        <option value="">Select State</option>
                        <option value="Andhra Pradesh">Andhra Pradesh</option>
                        <option value="Delhi">Delhi</option>
                        <option value="Gujarat">Gujarat</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Tamil Nadu">Tamil Nadu</option>
                        <option value="Uttar Pradesh">Uttar Pradesh</option>
                        {/* Add more states as needed */}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        PIN Code
                      </label>
                      <input
                        type="text"
                        id="pincode"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        required
                        pattern="[0-9]{6}"
                        className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-primary dark:focus:ring-primary-light focus:border-primary dark:focus:border-primary-light dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Payment Information */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Method</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        id="payment-card"
                        name="paymentMethod"
                        type="radio"
                        value="card"
                        checked={formData.paymentMethod === 'card'}
                        onChange={handleChange}
                        className="h-4 w-4 text-primary dark:text-primary-light focus:ring-primary-light dark:focus:ring-primary-dark"
                      />
                      <label htmlFor="payment-card" className="ml-3 flex items-center">
                        <CreditCardIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2" />
                        <span className="font-medium text-gray-900 dark:text-white">Credit / Debit Card</span>
                      </label>
                    </div>
                    
                    {formData.paymentMethod === 'card' && (
                      <div className="ml-7 mt-4 space-y-4">
                        <div>
                          <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Card Number
                          </label>
                          <input
                            type="text"
                            id="cardNumber"
                            name="cardNumber"
                            value={formData.cardNumber}
                            onChange={handleChange}
                            required
                            placeholder="1234 5678 9012 3456"
                            className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-primary dark:focus:ring-primary-light focus:border-primary dark:focus:border-primary-light dark:text-white dark:placeholder-gray-500"
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="cardExpiry" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Expiry Date
                            </label>
                            <input
                              type="text"
                              id="cardExpiry"
                              name="cardExpiry"
                              value={formData.cardExpiry}
                              onChange={handleChange}
                              required
                              placeholder="MM/YY"
                              className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-primary dark:focus:ring-primary-light focus:border-primary dark:focus:border-primary-light dark:text-white dark:placeholder-gray-500"
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="cardCvv" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              CVV
                            </label>
                            <input
                              type="password"
                              id="cardCvv"
                              name="cardCvv"
                              value={formData.cardCvv}
                              onChange={handleChange}
                              required
                              placeholder="123"
                              maxLength={3}
                              className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-primary dark:focus:ring-primary-light focus:border-primary dark:focus:border-primary-light dark:text-white dark:placeholder-gray-500"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center">
                      <input
                        id="payment-cod"
                        name="paymentMethod"
                        type="radio"
                        value="cod"
                        checked={formData.paymentMethod === 'cod'}
                        onChange={handleChange}
                        className="h-4 w-4 text-primary dark:text-primary-light focus:ring-primary-light dark:focus:ring-primary-dark"
                      />
                      <label htmlFor="payment-cod" className="ml-3 flex items-center">
                        <TruckIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2" />
                        <span className="font-medium text-gray-900 dark:text-white">Cash on Delivery</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
          
          {/* Order Summary */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Order Summary</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {cart.map((item, index) => {
                      // Find the selected variant
                      const variant = item.product.variants.find(
                        v => v.color === item.selectedColor && v.size === item.selectedSize
                      );
                      const price = variant ? variant.price : item.product.basePrice;
                      
                      return (
                        <div key={index} className="flex py-2 border-b border-gray-200 dark:border-gray-700">
                          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
                            <img
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              className="h-full w-full object-cover object-center"
                            />
                          </div>
                          <div className="ml-4 flex flex-1 flex-col">
                            <div>
                              <div className="flex justify-between text-sm font-medium text-gray-900 dark:text-white">
                                <h3 className="line-clamp-2">{item.product.name}</h3>
                                <p className="ml-4">₹{price.toLocaleString()}</p>
                              </div>
                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                {item.selectedColor} • {item.selectedSize}
                              </p>
                            </div>
                            <div className="flex flex-1 items-end justify-between text-xs">
                              <p className="text-gray-500 dark:text-gray-400">Qty {item.quantity}</p>
                              <p className="text-gray-900 dark:text-white font-medium">₹{(price * item.quantity).toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                      <span className="font-medium text-gray-900 dark:text-white">₹{totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Shipping</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {shippingFee > 0 ? `₹${shippingFee}` : 'Free'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Tax (18%)</span>
                      <span className="font-medium text-gray-900 dark:text-white">₹{tax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-base font-medium text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-700">
                      <span>Total</span>
                      <span>₹{orderTotal.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <button
                      type="submit"
                      onClick={handleSubmit}
                      disabled={isProcessing}
                      className={`w-full px-6 py-3 bg-primary dark:bg-primary-dark text-white font-medium rounded-md flex items-center justify-center ${
                        isProcessing ? 'opacity-75 cursor-not-allowed' : 'hover:bg-primary-dark dark:hover:bg-primary-dark/80'
                      } transition-colors`}
                    >
                      {isProcessing ? 'Processing...' : 'Place Order'}
                    </button>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                    <ShieldCheckIcon className="h-5 w-5 mr-1 text-green-500 dark:text-green-400" />
                    <span>Safe & Secure Payment</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

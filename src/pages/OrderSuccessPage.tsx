import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircleIcon, ArrowRightIcon, TruckIcon } from '@heroicons/react/24/outline';
import { orderAPI } from '../services/api';

interface LocationState {
  orderNumber: string;
  orderAmount: number;
}

export default function OrderSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | undefined;
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Redirect if accessed directly without state
  useEffect(() => {
    if (!state) {
      navigate('/');
      return;
    }
    
    // Fetch order details to get rider info
    const fetchOrderDetails = async () => {
      try {
        setIsLoading(true);
        const orderData = await orderAPI.getOrderById(state.orderNumber);
        setOrderDetails(orderData);
      } catch (err) {
        console.error('Failed to fetch order details:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [state, navigate]);
  
  if (!state) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex justify-center mb-6">
            <CheckCircleIcon className="h-16 w-16 text-green-500" />
          </div>
          
          <h2 className="text-center text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Order Successful!
          </h2>
          
          <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
            Thank you for your purchase. Your order has been received.
          </p>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-4 mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-300">Order ID:</span>
              <span className="font-medium text-gray-900 dark:text-white">{state.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Amount Paid:</span>
              <span className="font-medium text-gray-900 dark:text-white">₹{state.orderAmount.toLocaleString()}</span>
            </div>
            
            {/* Shipping Status */}
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <TruckIcon className="h-5 w-5 mr-2" />
                  <span>Order Status:</span>
                </div>
                <span className="font-medium px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500 rounded-full text-xs">
                  Paid
                </span>
              </div>
              {}
            </div>
          </div>
          
          <p className="text-center text-sm text-gray-600 dark:text-gray-300 mb-6">
            We've received your order and payment. Our admin will review your order and assign a delivery rider soon.
          </p>
          
          <div className="flex gap-4">
            <Link
              to="/"
              className="flex-1 text-center py-3 px-4 border border-primary text-primary dark:text-primary-light dark:border-primary-light font-medium rounded-md hover:bg-primary-light hover:bg-opacity-10 dark:hover:bg-opacity-10 transition-colors"
            >
              Continue Shopping
            </Link>
            <Link
              to="/orders"
              className="flex-1 flex items-center justify-center py-3 px-4 bg-primary dark:bg-primary-dark text-white font-medium rounded-md hover:bg-primary-dark dark:hover:bg-primary-dark/90 transition-colors"
            >
              <span>My Orders</span>
              <ArrowRightIcon className="h-4 w-4 ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

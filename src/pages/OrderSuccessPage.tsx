import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircleIcon, ArrowRightIcon, TruckIcon } from '@heroicons/react/24/outline';
import { orderAPI } from '../services/api';

interface LocationState {
  orderNumber: string;
  orderAmount: number;
}

// Define orderAPI methods if not imported from services/api
const assignRandomRider = async (orderId: string) => {
  // This function will make an API call to assign a random rider
  try {
    const response = await fetch(`/api/orders/${orderId}/assign-rider`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to assign rider');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error assigning rider:', error);
    throw error;
  }
};

// Add this function to orderAPI if it doesn't exist
if (!orderAPI.assignRandomRider) {
  orderAPI.assignRandomRider = assignRandomRider;
}

export default function OrderSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | undefined;
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [assigningRider, setAssigningRider] = useState(false);
  const [assignmentError, setAssignmentError] = useState<string | null>(null);
  
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
        
        // If there's no rider assigned, trigger random rider assignment automatically
        if (orderData && !orderData.riderId) {
          assignRiderToOrder();
        }
      } catch (err) {
        console.error('Failed to fetch order details:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [state, navigate]);
  
  // Function to assign a random rider to the order
  const assignRiderToOrder = async () => {
    if (!state || !state.orderNumber || assigningRider) return;
    
    try {
      setAssigningRider(true);
      setAssignmentError(null);
      
      // Call API to assign a random rider
      const updatedOrder = await orderAPI.assignRandomRider(state.orderNumber);
      
      // Update the order details with the newly assigned rider
      // Make sure the status is set to "paid" regardless of what comes from the API
      setOrderDetails({
        ...updatedOrder,
        status: "paid" // Explicitly set status to "paid" when a rider is assigned
      });
    } catch (err: any) {
      console.error('Failed to assign rider:', err);
      setAssignmentError(err.message || 'Failed to assign rider. Please try again.');
    } finally {
      setAssigningRider(false);
    }
  };
  
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
            
            {/* Show rider information when available */}
            {orderDetails?.riderId && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <TruckIcon className="h-5 w-5 mr-2" />
                    <span>Delivery Status:</span>
                  </div>
                  <span className="font-medium px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500 rounded-full text-xs">
                    paid
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Rider:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{orderDetails.riderName}</span>
                </div>
              </div>
            )}
          </div>
          
          <p className="text-center text-sm text-gray-600 dark:text-gray-300 mb-6">
            We've received your order.
            {orderDetails?.riderId ? 
              " Your order is on its way!" : 
              " A delivery rider will be assigned to your order soon."}
          </p>
          
          {/* Add manual rider assignment button if no rider is assigned yet and auto-assignment failed */}
          {!orderDetails?.riderId && !isLoading && assignmentError && (
            <div className="mb-6">
              <button
                onClick={assignRiderToOrder}
                disabled={assigningRider}
                className={`w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors ${
                  assigningRider ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {assigningRider ? 'Assigning Rider...' : 'Assign a Delivery Rider'}
              </button>
              
              {assignmentError && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-500">{assignmentError}</p>
              )}
            </div>
          )}
          
          {/* Show loading indicator for rider assignment */}
          {assigningRider && (
            <div className="mb-6 text-center text-gray-600 dark:text-gray-300">
              <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-primary mr-2"></div>
              Assigning a delivery rider...
            </div>
          )}
          
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

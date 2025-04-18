import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { TruckIcon, ArrowLeftIcon, CheckCircleIcon, MapPinIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { orderAPI } from '../../services/api';

interface OrderItem {
  productId: string;
  productName: string;
  color: string;
  size: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface Order {
  _id: string;
  customerId: string;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'PAID' | 'SHIPPED' | 'IN_TRANSIT' | 'DELIVERED';
  riderId?: string;
  riderName?: string;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser || !id) return;

    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const orderData = await orderAPI.getOrderById(id);
        setOrder(orderData);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Failed to load order details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id, currentUser]);

  if (!currentUser) {
    navigate('/login');
    return null;
  }

  // Function to get status info
  const getStatusInfo = () => {
    if (!order) return null;

    const stepCompleted = 'bg-primary dark:bg-primary-dark text-white';
    const stepCurrent = 'border-primary dark:border-primary-light text-primary dark:text-primary-light';
    const stepPending = 'border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500';

    const steps = [
      { name: 'PAID', label: 'Order Placed' },
      { name: 'SHIPPED', label: 'Processing' },
      { name: 'IN_TRANSIT', label: 'On Its Way' },
      { name: 'DELIVERED', label: 'Delivered' }
    ];

    const currentStepIndex = steps.findIndex(s => s.name === order.status);

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Order Status</h3>
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.name} className="flex flex-col items-center">
              <div className={`h-8 w-8 flex items-center justify-center rounded-full border-2 ${
                index < currentStepIndex ? stepCompleted : (index === currentStepIndex ? stepCurrent : stepPending)
              }`}>
                {index < currentStepIndex ? <CheckCircleIcon className="h-5 w-5" /> : index + 1}
              </div>
              <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">{step.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link 
          to="/orders" 
          className="inline-flex items-center text-primary dark:text-primary-light hover:underline mb-6"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Orders
        </Link>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Order Details
        </h1>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow">
            <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
            <button 
              onClick={() => navigate(-1)} 
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
            >
              Go Back
            </button>
          </div>
        ) : order ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Summary */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order ID and Date */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Order #{order._id.substring(0, 8)}...
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Placed on {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="mt-4 sm:mt-0">
                    <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                      order.status === 'DELIVERED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500' :
                      order.status === 'SHIPPED' || order.status === 'IN_TRANSIT' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Status Tracker */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                {getStatusInfo()}
              </div>
              
              {/* Order Items */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Order Items</h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0">
                      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.productName}
                            className="h-full w-full object-cover object-center"
                          />
                        ) : (
                          <div className="h-full w-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <span className="text-gray-500 dark:text-gray-400 text-xs">No Image</span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4 flex flex-1 flex-col">
                        <div>
                          <div className="flex justify-between text-base font-medium text-gray-900 dark:text-white">
                            <h4>{item.productName}</h4>
                            <p className="ml-4">₹{item.price.toLocaleString()}</p>
                          </div>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {item.color} • {item.size}
                          </p>
                        </div>
                        <div className="flex flex-1 items-end justify-between text-sm">
                          <p className="text-gray-500 dark:text-gray-400">Qty {item.quantity}</p>
                          <p className="font-medium text-gray-900 dark:text-white">₹{(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Delivery Info and Price Summary */}
            <div className="space-y-6">
              {/* Delivery Info */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Delivery Information</h3>
                
                <div className="space-y-3">
                  <div className="flex items-start">
                    <MapPinIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Shipping Address:</p>
                      <p className="text-sm text-gray-900 dark:text-white mt-1">{order.customerAddress}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <PhoneIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone Number:</p>
                      <p className="text-sm text-gray-900 dark:text-white mt-1">{order.customerPhone}</p>
                    </div>
                  </div>
                  
                  {order.riderId && (
                    <div className="flex items-start">
                      <TruckIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Delivery By:</p>
                        <p className="text-sm text-gray-900 dark:text-white mt-1">{order.riderName}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Price Summary */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Price Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                    <span className="text-gray-900 dark:text-white">₹{order.totalAmount.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Shipping</span>
                    <span className="text-gray-900 dark:text-white">Free</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Payment Method</span>
                    <span className="text-gray-900 dark:text-white">{order.paymentMethod}</span>
                  </div>
                  
                  <div className="pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-900 dark:text-white">Total</span>
                      <span className="font-medium text-gray-900 dark:text-white">₹{order.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Need Help */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Need Help?</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  Having issues with your order? Contact our customer support.
                </p>
                <Link
                  to={`/contact?subject=Order%20Issue&message=I%20need%20help%20with%20my%20order%20${order._id}`}
                  className="inline-block text-primary dark:text-primary-light hover:underline"
                >
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Order not found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">The order you're looking for doesn't exist or you don't have permission to view it.</p>
            <Link
              to="/orders"
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
            >
              Back to Orders
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

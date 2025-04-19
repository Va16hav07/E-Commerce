import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { orderAPI } from '../../services/api';

// Define the OrderStatus enum to match backend values exactly
enum OrderStatus {
  PAID = 'PAID',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  NOT_DELIVERED = 'NOT_DELIVERED'
}

// Define the Order type if it's not properly imported
interface OrderItem {
  productId: string;
  productName: string;
  color?: string;
  size?: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface Order {
  id: string;
  _id?: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: string;
  riderId?: string;
  riderName?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export default function RiderDashboard() {
  const { currentUser, logout } = useAuth();
  const riderId = currentUser?.id;
  
  // State for orders, loading, and error
  const [riderOrders, setRiderOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Add state for dropdown visibility
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  
  // Fetch rider's assigned orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log("Fetching orders for rider ID:", riderId);
        
        // Use the API service method
        const response = await orderAPI.getAssignedOrders();
        
        console.log("API Response:", response);
        
        if (response.success) {
          // Transform the response data to match our Order interface
          const transformedOrders = response.data.map((order: any) => ({
            id: order._id || order.id,
            _id: order._id,
            customerId: order.customerId,
            customerName: order.customerName,
            customerPhone: order.customerPhone,
            customerAddress: order.customerAddress,
            items: order.items || [],
            totalAmount: order.totalAmount || 0,
            status: order.status || OrderStatus.PAID,
            paymentMethod: order.paymentMethod || 'CARD',
            riderId: order.riderId,
            riderName: order.riderName,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt
          }));
          
          setRiderOrders(transformedOrders);
          console.log(`Successfully loaded ${transformedOrders.length} orders`);
        } else {
          setError('Failed to fetch orders: ' + (response.message || 'Unknown error'));
        }
      } catch (err: any) {
        console.error('Error fetching orders:', err);
        setError(`Error fetching your assigned orders: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (riderId) {
      fetchOrders();
    } else {
      console.warn("No rider ID available");
      setError("User identification error. Please login again.");
      setIsLoading(false);
    }
  }, [riderId]);
  
  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      setError(null);
      console.log(`Attempting to update order ${orderId} to status: ${newStatus}`);
      
      const response = await orderAPI.updateOrderStatus(orderId, newStatus);
      
      if (response && response.success) {
        console.log('Status update successful:', response);
        // Update local state with the updated order
        setRiderOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId || order._id === orderId
              ? { ...order, status: newStatus, updatedAt: new Date() } 
              : order
          )
        );
      } else {
        console.error('Status update failed:', response);
        setError('Failed to update order status');
      }
    } catch (err: any) {
      console.error('Error updating order status:', err);
      setError(`Error updating order status: ${err.message}`);
    }
  };
  
  // Function to get allowed next statuses for rider based on current status
  const getAllowedStatusesForRider = (currentStatus: OrderStatus): OrderStatus[] => {
    switch (currentStatus) {
      case OrderStatus.SHIPPED:
        return [OrderStatus.DELIVERED, OrderStatus.NOT_DELIVERED];
      default:
        return [];
    }
  };
  
  // Function to get badge color based on order status
  const getStatusBadgeClass = (status: OrderStatus): string => {
    switch (status) {
      case OrderStatus.PAID:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case OrderStatus.SHIPPED:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case OrderStatus.DELIVERED:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case OrderStatus.NOT_DELIVERED:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };
  
  // Function to get icon based on order status
  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.DELIVERED:
        return (
          <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case OrderStatus.NOT_DELIVERED:
        return (
          <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return (
          <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
          </svg>
        );
    }
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      // We don't need to handle redirect here as the ProtectedRoute
      // will automatically redirect to login when auth state changes
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              {/* Logo */}
              <Link to="/" className="flex-shrink-0 flex items-center">
                <svg className="h-8 w-8 text-primary dark:text-primary-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">CoolGarmi</span>
              </Link>
              
              {/* Navigation */}
              <nav className="hidden md:ml-6 md:flex space-x-8">
                <Link to="/rider" className="text-primary dark:text-primary-light border-primary dark:border-primary-light border-b-2 px-1 pt-1 text-sm font-medium">
                  Dashboard
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center">
              {/* Profile Dropdown - Fixed version */}
              <div className="ml-3 relative">
                <div>
                  <button 
                    className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary items-center"
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    onBlur={(e) => {
                      // Only close if focus didn't move to an element inside the dropdown
                      if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                        setTimeout(() => setIsProfileMenuOpen(false), 100);
                      }
                    }}
                  >
                    <div className="h-8 w-8 rounded-full bg-primary/20 dark:bg-primary-dark/30 flex items-center justify-center text-primary dark:text-primary-light">
                      {currentUser?.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="ml-2 hidden md:block text-gray-700 dark:text-gray-300">{currentUser?.name}</span>
                    <svg className="ml-1 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                
                {/* Dropdown Menu with click-based behavior instead of hover */}
                {isProfileMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 z-10"
                    onMouseDown={(e) => e.preventDefault()} // Prevent blur from closing the menu when clicking inside
                  >
                    <div className="py-1" role="menu" aria-orientation="vertical">
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full text-left block px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                        role="menuitem"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Mobile menu button */}
              <div className="flex items-center md:hidden ml-2">
                <button className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="flex flex-col items-start md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Hi, {currentUser?.name.split(' ')[0]}</h1>
            <p className="text-gray-600 dark:text-gray-400">Here are your assigned deliveries</p>
          </div>
          <div className="mt-2 md:mt-0 px-3 py-1 bg-primary-light text-primary dark:bg-primary-dark/30 dark:text-primary-light rounded-full text-sm font-medium">
            Rider
          </div>
        </div>
        
        {/* Display error message if exists */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}
        
        {/* Show loading state */}
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : riderOrders.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <svg className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No deliveries assigned</h3>
            <p className="text-gray-600 dark:text-gray-400">You don't have any orders assigned for delivery yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {riderOrders.map(order => {
              const allowedStatuses = getAllowedStatusesForRider(order.status);
              const orderId = order._id || order.id;
              
              return (
                <div key={orderId} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                  {/* Order Header */}
                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">Order #{orderId.substring(orderId.length - 6)}</span>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  
                  {/* Customer Info */}
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">Customer Details</h3>
                    <div className="text-sm space-y-1">
                      <p><span className="text-gray-600 dark:text-gray-400">Name:</span> <span className="dark:text-gray-300">{order.customerName}</span></p>
                      <p><span className="text-gray-600 dark:text-gray-400">Phone:</span> <span className="dark:text-gray-300">{order.customerPhone}</span></p>
                      <p><span className="text-gray-600 dark:text-gray-400">Address:</span> <span className="dark:text-gray-300">{order.customerAddress}</span></p>
                    </div>
                  </div>
                  
                  {/* Order Items */}
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">Order Items ({order.items.length})</h3>
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="text-sm">
                          <div className="flex justify-between">
                            <div className="font-medium dark:text-white">{item.productName}</div>
                            <div className="dark:text-gray-300">₹{item.price.toLocaleString()}</div>
                          </div>
                          <div className="text-gray-600 dark:text-gray-400">
                            {item.color} • {item.size} • Qty: {item.quantity}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Total */}
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                    <div className="flex justify-between font-medium">
                      <span className="dark:text-gray-300">Total Amount:</span>
                      <span className="dark:text-white">₹{order.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  {allowedStatuses.length > 0 && (
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">Update Status</h3>
                      <div className="flex flex-wrap gap-2">
                        {allowedStatuses.map(status => (
                          <button
                            key={status}
                            onClick={() => handleStatusChange(orderId, status)}
                            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                              status === OrderStatus.DELIVERED 
                                ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-300 dark:hover:bg-green-900/60' 
                                : status === OrderStatus.NOT_DELIVERED
                                ? 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-300 dark:hover:bg-red-900/60'
                                : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:hover:bg-indigo-900/60'
                            }`}
                          >
                            <span className="mr-1">{getStatusIcon(status)}</span>
                            Mark as {status}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

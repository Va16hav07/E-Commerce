import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
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
  const { theme, toggleTheme } = useTheme();
  const riderId = currentUser?.id;
  
  // State for orders, loading, and error
  const [riderOrders, setRiderOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Add state for dropdown visibility
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  
  // Add state for active tab
  const [activeTab, setActiveTab] = useState('orders');
  
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
              <nav className="ml-6 flex space-x-8">
                <button 
                  onClick={() => setActiveTab('orders')}
                  className={`${activeTab === 'orders' ? 'text-primary dark:text-primary-light border-primary dark:border-primary-light border-b-2' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'} px-1 pt-1 text-sm font-medium`}
                >
                  Orders
                </button>
                <button 
                  onClick={() => setActiveTab('profile')}
                  className={`${activeTab === 'profile' ? 'text-primary dark:text-primary-light border-primary dark:border-primary-light border-b-2' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'} px-1 pt-1 text-sm font-medium`}
                >
                  Profile
                </button>
              </nav>
            </div>
            
            <div className="flex items-center">
              {/* Theme toggle button */}
              <button
                onClick={toggleTheme}
                className="mr-4 p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
                aria-label="Toggle dark mode"
              >
                {theme === 'dark' ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
              
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
                
                {/* Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 z-10"
                    onMouseDown={(e) => e.preventDefault()} 
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
            </div>
          </div>
        </div>
      </header>
      
      <div className="w-full max-w-lg mx-auto px-4 py-6 sm:py-8">
        <div className="flex flex-col items-start md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Hi, {currentUser?.name.split(' ')[0]}</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              {activeTab === 'orders' ? 'Here are your assigned deliveries' : 'Your profile information'}
            </p>
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
        
        {/* Profile Section */}
        {activeTab === 'profile' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="px-4 sm:px-6 py-5 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-primary/20 dark:bg-primary-dark/30 flex items-center justify-center text-xl sm:text-2xl font-bold text-primary dark:text-primary-light">
                  {currentUser?.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <h2 className="mt-4 text-lg sm:text-xl font-semibold text-center text-gray-900 dark:text-white">{currentUser?.name}</h2>
              <p className="text-center text-sm sm:text-base text-gray-600 dark:text-gray-400">{currentUser?.email}</p>
            </div>
            
            <div className="p-4 sm:p-6">
              <div className="mb-6">
                <h3 className="text-md sm:text-lg font-medium text-gray-900 dark:text-white mb-2">Personal Information</h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-3 sm:p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Full Name</p>
                      <p className="text-sm sm:text-base font-medium dark:text-white">{currentUser?.name}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Email Address</p>
                      <p className="text-sm sm:text-base font-medium dark:text-white">{currentUser?.email}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Phone Number</p>
                      <p className="text-sm sm:text-base font-medium dark:text-white">{currentUser?.phone || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-md sm:text-lg font-medium text-gray-900 dark:text-white mb-2">Performance</h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-3 sm:p-4">
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-white dark:bg-gray-800 p-2 sm:p-3 rounded-lg shadow-sm">
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Deliveries Completed</p>
                      <p className="text-xl sm:text-2xl font-bold dark:text-white">
                        {riderOrders.filter(o => o.status === OrderStatus.DELIVERED).length}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-2 sm:p-3 rounded-lg shadow-sm">
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Pending Deliveries</p>
                      <p className="text-xl sm:text-2xl font-bold dark:text-white">
                        {riderOrders.filter(o => o.status === OrderStatus.SHIPPED).length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Orders Section */}
        {activeTab === 'orders' && (
          <>
            {/* Show loading state */}
            {isLoading ? (
              <div className="flex justify-center items-center py-8 sm:py-10">
                <svg className="animate-spin h-8 w-8 sm:h-10 sm:w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : riderOrders.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 text-center">
                <svg className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 dark:text-gray-500 mx-auto mb-3 sm:mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
                <h3 className="text-md sm:text-lg font-medium text-gray-900 dark:text-white mb-1">No deliveries assigned</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">You don't have any orders assigned for delivery yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {riderOrders.map(order => {
                  const allowedStatuses = getAllowedStatusesForRider(order.status);
                  const orderId = order._id || order.id;
                  
                  return (
                    <div key={orderId} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                      {/* Order Header */}
                      <div className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 dark:bg-gray-700 flex flex-col sm:flex-row sm:justify-between sm:items-center">
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white">Order #{orderId.substring(orderId.length - 6)}</span>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        <span className={`mt-1 sm:mt-0 self-start sm:self-center px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      
                      {/* Customer Info */}
                      <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="font-medium text-sm sm:text-base text-gray-900 dark:text-white mb-2">Customer Details</h3>
                        <div className="text-xs sm:text-sm space-y-1">
                          <p><span className="text-gray-600 dark:text-gray-400">Name:</span> <span className="dark:text-gray-300">{order.customerName}</span></p>
                          <p><span className="text-gray-600 dark:text-gray-400">Phone:</span> <span className="dark:text-gray-300">{order.customerPhone}</span></p>
                          <p><span className="text-gray-600 dark:text-gray-400">Address:</span> <span className="dark:text-gray-300 break-words">{order.customerAddress}</span></p>
                        </div>
                      </div>
                      
                      {/* Order Items */}
                      <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="font-medium text-sm sm:text-base text-gray-900 dark:text-white mb-2">Order Items ({order.items.length})</h3>
                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="text-xs sm:text-sm">
                              <div className="flex justify-between items-start">
                                <div className="font-medium dark:text-white mr-2 flex-1">{item.productName}</div>
                                <div className="dark:text-gray-300 whitespace-nowrap">₹{item.price.toLocaleString()}</div>
                              </div>
                              <div className="text-gray-600 dark:text-gray-400 text-xs">
                                {item.color && item.size ? `${item.color} • ${item.size} • ` : ''} Qty: {item.quantity}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Total */}
                      <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                        <div className="flex justify-between font-medium">
                          <span className="text-sm dark:text-gray-300">Total Amount:</span>
                          <span className="text-sm dark:text-white">₹{order.totalAmount.toLocaleString()}</span>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      {allowedStatuses.length > 0 && (
                        <div className="p-3 sm:p-4">
                          <h3 className="font-medium text-sm sm:text-base text-gray-900 dark:text-white mb-2">Update Status</h3>
                          <div className="flex flex-wrap gap-2">
                            {allowedStatuses.map(status => (
                              <button
                                key={status}
                                onClick={() => handleStatusChange(orderId, status)}
                                className={`flex items-center px-2 sm:px-3 py-1 sm:py-2 rounded-md text-xs sm:text-sm font-medium ${
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
          </>
        )}
      </div>
    </div>
  );
}

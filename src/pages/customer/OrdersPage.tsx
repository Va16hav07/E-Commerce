import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { TruckIcon, UserIcon, KeyIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { orderAPI } from '../../services/api';

// Define the order and order item types
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

export default function OrdersPage() {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) return;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const orderData = await orderAPI.getUserOrders();
        setOrders(orderData);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load your orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser]);

  if (!currentUser) {
    // Redirect to login if not authenticated
    navigate('/login');
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  // Function to get the appropriate status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'SHIPPED':
      case 'IN_TRANSIT':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
      case 'CANCELLED':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      case 'PAID':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="bg-white dark:bg-gray-900 w-full">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Orders</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center mb-6">
                <div className="bg-primary/10 dark:bg-primary-dark/30 rounded-full p-3 mr-4">
                  <UserIcon className="h-6 w-6 text-primary dark:text-primary-light" />
                </div>
                <div>
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">{currentUser.name}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{currentUser.email}</p>
                </div>
              </div>
              
              <nav className="space-y-1">
                <Link to="/account" className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-md">
                  <UserIcon className="mr-3 h-5 w-5" aria-hidden="true" />
                  Account Overview
                </Link>
                <Link to="/orders" className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary dark:bg-primary-dark rounded-md">
                  <TruckIcon className="mr-3 h-5 w-5" aria-hidden="true" />
                  Orders
                </Link>
                
                {/* Theme toggle */}
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-md"
                >
                  {theme === 'dark' ? (
                    <>
                      <SunIcon className="mr-3 h-5 w-5" aria-hidden="true" />
                      Light Mode
                    </>
                  ) : (
                    <>
                      <MoonIcon className="mr-3 h-5 w-5" aria-hidden="true" />
                      Dark Mode
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-md"
                >
                  <KeyIcon className="mr-3 h-5 w-5" aria-hidden="true" />
                  Logout
                </button>
              </nav>
            </div>
          </div>
          
          {/* Main content */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Order History</h2>
              
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-primary-light"></div>
                </div>
              ) : error ? (
                <div className="text-center py-10">
                  <p className="text-red-500 dark:text-red-400">{error}</p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                  >
                    Try Again
                  </button>
                </div>
              ) : orders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Order ID
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Total
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Items
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Action</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {orders.map((order) => (
                        <tr key={order._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {order._id.substring(0, 8)}...
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(order.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            ₹{order.totalAmount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {order.items.reduce((acc, item) => acc + item.quantity, 0)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link to={`/orders/${order._id}`} className="text-primary dark:text-primary-light hover:text-primary-dark">
                              View Details
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <TruckIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No orders found</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    You haven't placed any orders yet.
                  </p>
                  <div className="mt-6">
                    <Link
                      to="/products"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary dark:bg-primary-dark hover:bg-primary-dark dark:hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      Start Shopping
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

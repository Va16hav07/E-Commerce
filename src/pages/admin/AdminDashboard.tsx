import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Order, OrderStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';  
import { orderAPI } from '../../services/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { logout, currentUser } = useAuth();  
  const [activeTab, setActiveTab] = useState<'orders' | 'riders'>('orders');
  const [orderList, setOrderList] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Check authentication on load
  useEffect(() => {
    if (!currentUser) {
      console.log("No authenticated user, redirecting to login");
      navigate('/login', { state: { message: 'Please log in to access the admin dashboard' } });
    } else if (currentUser.role !== 'ADMIN') {
      console.log(`User role ${currentUser.role} not allowed to access admin dashboard`);
      navigate('/');
    }
  }, [currentUser, navigate]);
  
  // Fetch all orders when component mounts and authenticated
  useEffect(() => {
    if (currentUser && currentUser.role === 'ADMIN') {
      console.log("Admin user authenticated, fetching orders...");
      fetchOrders();
    }
  }, [currentUser]);
  
  // Function to fetch all orders from the backend
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching orders...");
      
      const response = await orderAPI.getAllOrders();
      console.log("Orders response:", response);
      
      if (response && response.success && response.data) {
        setOrderList(response.data);
      } else {
        setError('Failed to load orders data.');
      }
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'An error occurred while fetching orders.');
    } finally {
      setLoading(false);
    }
  };
  
  // Group orders by rider
  const ordersByRider: Record<string, Order[]> = {};
  orderList.forEach(order => {
    if (order.riderId) {
      if (!ordersByRider[order.riderId]) {
        ordersByRider[order.riderId] = [];
      }
      ordersByRider[order.riderId].push(order);
    }
  });

  // Updated Logout function to handle user logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  // Handle status change with API call
  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      setError(null);
      console.log(`Updating order ${orderId} status to ${newStatus} as admin`);
      
      const response = await orderAPI.updateOrderStatus(orderId, newStatus);
      
      if (response && response.success) {
        console.log('Status update successful:', response);
        // Refresh orders to get the updated data
        await fetchOrders();
      } else {
        console.error('Status update failed:', response);
        setError('Failed to update order status.');
      }
    } catch (err: any) {
      console.error('Error updating status:', err);
      setError(err.message || 'An error occurred while updating status.');
    }
  };

  // Function to handle View button click
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  // Function to close the order details modal
  const closeOrderModal = () => {
    setShowOrderModal(false);
    setSelectedOrder(null);
  };
  
  // Function to get allowed next statuses for admin based on current status
  const getAllowedStatusesForAdmin = (currentStatus: OrderStatus): OrderStatus[] => {
    switch (currentStatus) {
      case OrderStatus.PAID:
        return [OrderStatus.SHIPPED];
      case OrderStatus.SHIPPED:
        return [OrderStatus.IN_TRANSIT];
      default:
        return [];
    }
  };
  
  // Function to get badge color based on order status
  const getStatusBadgeClass = (status: OrderStatus): string => {
    switch (status) {
      case OrderStatus.PLACED:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case OrderStatus.PAID:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case OrderStatus.SHIPPED:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case OrderStatus.IN_TRANSIT:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case OrderStatus.ON_THE_WAY:
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
      case OrderStatus.DELIVERED:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case OrderStatus.UNDELIVERED:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };
  
  // Convert date string to Date object safely
  const formatDate = (dateString: string | Date): Date => {
    if (dateString instanceof Date) {
      return dateString;
    }
    return new Date(dateString);
  };
  
  return (
    // Full page admin dashboard with sidebar layout
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 shadow-md">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Admin Panel CoolGarmi</h2>
        </div>
        <div className="py-4">
          <ul>
            <li className="mb-1">
              <button 
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center px-4 py-2 text-sm ${
                  activeTab === 'orders' 
                    ? 'bg-gray-200 dark:bg-gray-700 font-medium text-primary dark:text-primary-light' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Orders
              </button>
            </li>
            <li className="mb-1">
              <button 
                onClick={() => setActiveTab('riders')}
                className={`w-full flex items-center px-4 py-2 text-sm ${
                  activeTab === 'riders' 
                    ? 'bg-gray-200 dark:bg-gray-700 font-medium text-primary dark:text-primary-light' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Riders
              </button>
            </li>
          </ul>
          <div className="mt-auto pt-4 px-4">
            <button 
              onClick={handleLogout}
              className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 px-4 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {activeTab === 'orders' ? 'Orders Management' : 'Riders Management'}
          </h1>
          
          {/* Error message */}
          {error && (
            <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 dark:bg-red-900/30 dark:text-red-400">
              <p>{error}</p>
            </div>
          )}
          
          {/* Loading state */}
          {loading && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          )}
          
          {/* Orders Tab Content */}
          {activeTab === 'orders' && !loading && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rider</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {orderList.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                          No orders found
                        </td>
                      </tr>
                    ) : (
                      orderList.map((order) => {
                        const allowedStatuses = getAllowedStatusesForAdmin(order.status);
                        const createdAt = formatDate(order.createdAt);
                        const updatedAt = formatDate(order.updatedAt);
                        const orderId = order._id || order.id;
                        
                        if (!orderId) return null;
                        
                        return (
                          <tr key={orderId}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="font-medium text-gray-900 dark:text-white">#{orderId.substring(orderId.length - 6)}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">{order.customerName}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{order.customerPhone}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">₹{order.totalAmount.toLocaleString()}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{order.items.length} items</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(order.status)}`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {order.riderName || 'Not assigned'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">
                                {createdAt.toLocaleDateString()}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {updatedAt.toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleViewOrder(order)}
                                  className="text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-primary-light/80"
                                >
                                  View
                                </button>
                                
                                {allowedStatuses.length > 0 && (
                                  <select
                                    onChange={(e) => handleStatusChange(orderId, e.target.value as OrderStatus)}
                                    className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                                    defaultValue=""
                                  >
                                    <option value="" disabled>Change status</option>
                                    {allowedStatuses.map((status) => (
                                      <option key={status} value={status}>
                                        Update to {status}
                                      </option>
                                    ))}
                                  </select>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Riders Tab Content */}
          {activeTab === 'riders' && !loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(ordersByRider).map(([riderId, riderOrders]) => {
                const firstOrder = riderOrders[0]; // To get rider name
                if (!firstOrder) return null;
                
                
                return (
                  <div key={riderId} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4">
                      <h3 className="font-medium text-gray-900 dark:text-white">{firstOrder.riderName}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">ID: {riderId}</p>
                    </div>
                    <div className="p-6">
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Assigned Orders</h4>
                      <div className="space-y-2">
                        {riderOrders.map(order => (
                          <div key={order._id || order.id} className="border border-gray-200 dark:border-gray-700 rounded-md p-3">
                            <div className="flex justify-between items-center">
                              <span className="font-medium dark:text-white">
                                #{(order._id || order.id || '').substring((order._id || order.id || '').length - 6)}
                              </span>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(order.status)}`}>
                                {order.status}
                              </span>
                            </div>
                            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                              {order.customerName} • ₹{order.totalAmount.toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {Object.keys(ordersByRider).length === 0 && (
                <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
                  No riders with assigned orders found
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                Order #{(selectedOrder._id || selectedOrder.id || '').substring((selectedOrder._id || selectedOrder.id || '').length - 6)}
              </h3>
              <button 
                onClick={closeOrderModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Order Information */}
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-white mb-2">Order Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Status:</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(selectedOrder.status)}`}>
                        {selectedOrder.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total Amount:</span>
                      <span className="font-medium">₹{selectedOrder.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Payment Method:</span>
                      <span>{selectedOrder.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Created On:</span>
                      <span>{formatDate(selectedOrder.createdAt).toLocaleDateString()} {formatDate(selectedOrder.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Last Updated:</span>
                      <span>{formatDate(selectedOrder.updatedAt).toLocaleDateString()} {formatDate(selectedOrder.updatedAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
                
                {/* Customer Information */}
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-white mb-2">Customer Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Name:</span>
                      <span>{selectedOrder.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                      <span>{selectedOrder.customerPhone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Delivery Address:</span>
                      <span className="text-right">{selectedOrder.customerAddress}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Order Items */}
              <div className="mt-6">
                <h4 className="font-medium text-gray-800 dark:text-white mb-2">Order Items</h4>
                <div className="border rounded-md dark:border-gray-700 overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Item</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Variant</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quantity</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {selectedOrder.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {item.productName || item.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {item.color && item.size ? `${item.color}, ${item.size}` : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.quantity}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">₹{item.price.toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">₹{(item.quantity * item.price).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Rider Information (if assigned) */}
              {selectedOrder.riderId && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-800 dark:text-white mb-2">Delivery Information</h4>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedOrder.riderName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Rider ID: {selectedOrder.riderId}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 flex justify-end">
              <button 
                onClick={closeOrderModal}
                className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 px-4 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

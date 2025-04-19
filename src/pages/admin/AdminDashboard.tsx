import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Order } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { orderAPI } from '../../services/api';

// Define simplified OrderStatus enum to match the backend's expected values
enum SimplifiedOrderStatus {
  PAID = 'PAID',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  NOT_DELIVERED = 'NOT_DELIVERED'
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { logout, currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'orders' | 'riders'>('orders');
  const [orderList, setOrderList] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // New state for rider management
  const [riderList, setRiderList] = useState<any[]>([]);
  const [showAssignRiderModal, setShowAssignRiderModal] = useState(false);
  const [orderToAssign, setOrderToAssign] = useState<Order | null>(null);
  const [selectedRiderId, setSelectedRiderId] = useState<string>('');
  const [assigningRider, setAssigningRider] = useState(false);

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
      fetchRiders(); // Fetch riders for assignment
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

  // Function to fetch all riders
  const fetchRiders = async () => {
    try {
      console.log("Fetching riders for admin dashboard...");
      setError(null);
      
      // Use the proper API method we just created
      const response = await orderAPI.getAllRiders();
      
      if (response && response.success) {
        console.log("Riders fetched successfully:", response.data);
        setRiderList(response.data);
      } else {
        console.error('Failed to fetch riders:', response);
        setError('Failed to load riders data.');
      }
    } catch (err: any) {
      console.error('Error fetching riders:', err);
      setError(err.message || 'An error occurred while fetching riders.');
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
  const handleStatusChange = async (orderId: string, newStatus: SimplifiedOrderStatus) => {
    try {
      setError(null);
      console.log(`Updating order ${orderId} status to ${newStatus} as admin`);
      
      const response = await orderAPI.updateOrderStatus(orderId, newStatus);
      
      if (response && response.success) {
        console.log('Status update successful:', response);
        
        // Auto-assign rider when status changes to SHIPPED
        if (newStatus === SimplifiedOrderStatus.SHIPPED) {
          await autoAssignRider(orderId);
        }
        
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

  // Function to automatically assign a rider to a SHIPPED order
  const autoAssignRider = async (orderId: string) => {
    try {
      // Get the order details
      const orderToUpdate = orderList.find(order => order._id === orderId || order.id === orderId);
      if (!orderToUpdate) {
        throw new Error('Order not found');
      }
      
      // Check if order already has a rider
      if (orderToUpdate.riderId) {
        console.log('Order already has a rider assigned, skipping auto-assignment');
        return;
      }
      
      // Just pick any rider from the list, regardless of current assignment status
      if (riderList.length === 0) {
        setError('No riders available in the system. Please add riders first.');
        return;
      }
      
      // Select a random rider for more even distribution of orders
      const randomIndex = Math.floor(Math.random() * riderList.length);
      const selectedRider = riderList[randomIndex];
      
      console.log(`Auto-assigning rider ${selectedRider.name} to order ${orderId}`);
      
      // Assign the rider to the order
      const response = await orderAPI.assignRider(
        orderId,
        selectedRider._id,
        selectedRider.name
      );
      
      if (response && response.success) {
        console.log('Auto-assignment successful:', response);
      } else {
        console.error('Auto-assignment failed:', response);
        setError('Failed to auto-assign rider.');
      }
    } catch (err: any) {
      console.error('Error auto-assigning rider:', err);
      setError(err.message || 'An error occurred while auto-assigning rider.');
    }
  };

  // Function to show the assign rider modal
  const showAssignRider = (order: Order) => {
    setOrderToAssign(order);
    setSelectedRiderId('');
    setShowAssignRiderModal(true);
  };

  // Function to close the assign rider modal
  const closeAssignRiderModal = () => {
    setShowAssignRiderModal(false);
    setOrderToAssign(null);
    setSelectedRiderId('');
  };

  // Function to assign a rider to an order
  const handleAssignRider = async () => {
    if (!orderToAssign || !selectedRiderId) {
      setError('Please select a rider to assign.');
      return;
    }

    try {
      setAssigningRider(true);
      
      // Find the rider name from the rider list
      const selectedRider = riderList.find(rider => rider._id === selectedRiderId);
      if (!selectedRider) {
        throw new Error('Selected rider not found');
      }
      
      const response = await orderAPI.assignRider(
        orderToAssign._id, 
        selectedRiderId,
        selectedRider.name
      );
      
      if (response && response.success) {
        await fetchOrders(); // Refresh orders list
        closeAssignRiderModal();
      } else {
        setError('Failed to assign rider.');
      }
    } catch (err: any) {
      console.error('Error assigning rider:', err);
      setError(err.message || 'An error occurred while assigning rider.');
    } finally {
      setAssigningRider(false);
    }
  };

  // Function to unassign a rider from an order
  const handleUnassignRider = async (orderId: string) => {
    try {
      setError(null);
      console.log(`Unassigning rider from order ${orderId}`);
      
      const response = await orderAPI.unassignRider(orderId);
      
      if (response && response.success) {
        console.log('Rider unassignment successful:', response);
        // Refresh orders to get the updated data
        await fetchOrders();
      } else {
        console.error('Rider unassignment failed:', response);
        setError('Failed to unassign rider.');
      }
    } catch (err: any) {
      console.error('Error unassigning rider:', err);
      setError(err.message || 'An error occurred while unassigning rider.');
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
  const getAllowedStatusesForAdmin = (currentStatus: string): SimplifiedOrderStatus[] => {
    switch (currentStatus) {
      case SimplifiedOrderStatus.PAID:
        return [SimplifiedOrderStatus.SHIPPED];
      case SimplifiedOrderStatus.SHIPPED:
        return [SimplifiedOrderStatus.DELIVERED, SimplifiedOrderStatus.NOT_DELIVERED];
      case SimplifiedOrderStatus.DELIVERED:
      case SimplifiedOrderStatus.NOT_DELIVERED:
        // Terminal states - no further transitions
        return [];
      default:
        return [];
    }
  };
  
  // Function to get badge color based on order status
  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case SimplifiedOrderStatus.PAID:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case SimplifiedOrderStatus.SHIPPED:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case SimplifiedOrderStatus.DELIVERED:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case SimplifiedOrderStatus.NOT_DELIVERED:
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
    
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full md:w-64 bg-white dark:bg-gray-800 shadow-md md:min-h-screen">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Admin Panel CoolGarmi</h2>
          <div className="flex items-center">
            {/* Theme toggle button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary mr-2"
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
            
            <button 
              className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
              onClick={() => setActiveTab(activeTab === 'orders' ? 'riders' : 'orders')}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>
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
      
      {/* Main content - responsive */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 md:p-6">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6">
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
          
          {/* Orders Tab Content - with scroll for small screens */}
          {activeTab === 'orders' && !loading && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order ID</th>
                      <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                      <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                      <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="hidden md:table-cell px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rider</th>
                      <th className="hidden md:table-cell px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                      <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {orderList.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-3 md:px-6 py-4 text-center text-gray-500 dark:text-gray-400">
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
                            <td className="px-3 md:px-6 py-2 md:py-4 whitespace-nowrap">
                              <span className="font-medium text-gray-900 dark:text-white">#{orderId.substring(orderId.length - 6)}</span>
                            </td>
                            <td className="px-3 md:px-6 py-2 md:py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">{order.customerName}</div>
                              <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">{order.customerPhone}</div>
                            </td>
                            <td className="px-3 md:px-6 py-2 md:py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">₹{order.totalAmount.toLocaleString()}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{order.items.length} items</div>
                            </td>
                            <td className="px-3 md:px-6 py-2 md:py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(order.status)}`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="hidden md:table-cell px-3 md:px-6 py-2 md:py-4 whitespace-nowrap text-sm">
                              {order.riderId ? (
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-900 dark:text-white">{order.riderName}</span>
                                  <button
                                    onClick={() => handleUnassignRider(orderId)}
                                    className="ml-2 text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                    title="Unassign rider"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => showAssignRider(order)}
                                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                  Assign Rider
                                </button>
                              )}
                            </td>
                            <td className="hidden md:table-cell px-3 md:px-6 py-2 md:py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">
                                {createdAt.toLocaleDateString()}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {updatedAt.toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-3 md:px-6 py-2 md:py-4 whitespace-nowrap text-sm">
                              <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-2">
                                <button
                                  onClick={() => handleViewOrder(order)}
                                  className="text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-primary-light/80"
                                >
                                  View
                                </button>
                                
                                {/* On mobile, show assign rider button if not shown in a hidden column */}
                                <div className="md:hidden">
                                  {order.riderId ? (
                                    <button
                                      onClick={() => handleUnassignRider(orderId)}
                                      className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                    >
                                      Unassign
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => showAssignRider(order)}
                                      className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                    >
                                      Assign
                                    </button>
                                  )}
                                </div>
                                
                                {allowedStatuses.length > 0 && (
                                  <select
                                    onChange={(e) => handleStatusChange(orderId, e.target.value as SimplifiedOrderStatus)}
                                    className="text-xs md:text-sm border border-gray-300 dark:border-gray-600 rounded-md px-1 md:px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                                    defaultValue=""
                                    style={{ 
                                      color: theme === 'dark' ? '#f9fafb' : '#374151', // Light gray in dark mode, dark gray in light mode
                                      appearance: 'menulist-button'  // Ensures dropdown arrow appears
                                    }}
                                  >
                                    <option value="" disabled style={{ color: '#6B7280' }}>Change status</option>
                                    {allowedStatuses.map((status) => (
                                      <option 
                                        key={status} 
                                        value={status}
                                        style={{ 
                                          color: theme === 'dark' ? '#f9fafb' : '#374151',
                                          backgroundColor: theme === 'dark' ? '#4B5563' : 'white' 
                                        }}
                                      >
                                        {status}
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
          
          {/* Riders Tab Content - responsive grid layout */}
          {activeTab === 'riders' && !loading && (
            <div>
              {/* Summary stats for riders - responsive grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Riders</h3>
                  <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{riderList.length}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Active Riders</h3>
                  <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                    {Object.keys(ordersByRider).length}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:col-span-2 md:col-span-1">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Available Riders</h3>
                  <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                    {riderList.length - Object.keys(ordersByRider).length}
                  </p>
                </div>
              </div>
              
              {/* All riders list - responsive table */}
              <div className="mb-8">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">All Riders</h2>
                {riderList.length === 0 ? (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center text-gray-500 dark:text-gray-400">
                    No riders found in the system
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th scope="col" className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                            <th scope="col" className="hidden sm:table-cell px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</th>
                            <th scope="col" className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Orders</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {riderList.map(rider => {
                            const riderOrders = ordersByRider[rider._id] || [];
                            const isActive = riderOrders.length > 0;
                            
                            return (
                              <tr key={rider._id}>
                                <td className="px-3 md:px-6 py-2 md:py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
                                      {rider.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-gray-900 dark:text-white">{rider.name}</div>
                                      <div className="text-sm text-gray-500 dark:text-gray-400">ID: {rider._id.substring(rider._id.length - 6)}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="hidden sm:table-cell px-3 md:px-6 py-2 md:py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900 dark:text-white">{rider.email}</div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">{rider.phone || 'No phone'}</div>
                                </td>
                                <td className="px-3 md:px-6 py-2 md:py-4 whitespace-nowrap">
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    isActive 
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500' 
                                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                                  }`}>
                                    {isActive ? 'Active' : 'Available'}
                                  </span>
                                </td>
                                <td className="px-3 md:px-6 py-2 md:py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                  {riderOrders.length > 0 ? (
                                    <div className="flex items-center">
                                      <span>{riderOrders.length} {riderOrders.length === 1 ? 'order' : 'orders'}</span>
                                    </div>
                                  ) : (
                                    'No orders assigned'
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Riders with assigned orders - responsive grid */}
              {Object.keys(ordersByRider).length > 0 && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Riders with Assigned Orders</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {Object.entries(ordersByRider).map(([riderId, riderOrders]) => {
                      const firstOrder = riderOrders[0]; // To get rider name
                      if (!firstOrder) return null;
                      
                      // Find the rider from the full list to get more details
                      const riderDetails = riderList.find(rider => rider._id === riderId);
                      
                      return (
                        <div key={riderId} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                          <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-medium text-gray-900 dark:text-white">{firstOrder.riderName}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {riderDetails?.phone || 'No phone'} • {riderDetails?.email || 'No email'}
                                </p>
                              </div>
                              <div className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500 rounded-full text-xs">
                                Active
                              </div>
                            </div>
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
                                  <div className="mt-2 flex justify-between">
                                    <button
                                      onClick={() => handleViewOrder(order)}
                                      className="text-xs text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-primary-light/80"
                                    >
                                      View Details
                                    </button>
                                    <button
                                      onClick={() => handleUnassignRider(order._id || order.id || '')}
                                      className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                    >
                                      Unassign
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal - responsive */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 p-3 md:p-4">
              <h3 className="text-lg md:text-xl font-medium text-gray-900 dark:text-white">
                Order #{(selectedOrder._id || selectedOrder.id || '').substring((selectedOrder._id || selectedOrder.id || '').length - 6)}
              </h3>
              <button 
                onClick={closeOrderModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {/* Order and Customer Information - stacked on mobile */}
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
              
              {/* Order Items - horizontally scrollable on mobile */}
              <div className="mt-4 md:mt-6">
                <h4 className="font-medium text-gray-800 dark:text-white mb-2">Order Items</h4>
                <div className="border rounded-md dark:border-gray-700 overflow-hidden">
                  <div className="overflow-x-auto">
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
              </div>
              
              {/* Rider Information - responsive layout */}
              <div className="mt-6">
                <h4 className="font-medium text-gray-800 dark:text-white mb-2">Delivery Information</h4>
                {selectedOrder.riderId ? (
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedOrder.riderName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Rider ID: {selectedOrder.riderId}</p>
                      </div>
                      <button
                        onClick={() => {
                          closeOrderModal(); // Close the view modal
                          handleUnassignRider(selectedOrder._id || selectedOrder.id || '');
                        }}
                        className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 px-3 py-1 border border-red-600 dark:border-red-400 rounded-md"
                      >
                        Unassign Rider
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                    <p className="text-sm text-gray-500 dark:text-gray-400">No rider assigned</p>
                    <button
                      onClick={() => {
                        closeOrderModal(); // Close the view modal
                        showAssignRider(selectedOrder);
                      }}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 px-3 py-1 border border-blue-600 dark:border-blue-400 rounded-md"
                    >
                      Assign Rider
                    </button>
                  </div>
                )}
              </div>
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
      
      {/* Assign Rider Modal - responsive */}
      {showAssignRiderModal && orderToAssign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 p-3 md:p-4">
              <h3 className="text-lg md:text-xl font-medium text-gray-900 dark:text-white">
                Assign Rider
              </h3>
              <button 
                onClick={closeAssignRiderModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 md:p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Rider
                </label>
                {riderList.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No riders available</p>
                ) : (
                  <select
                    value={selectedRiderId}
                    onChange={(e) => setSelectedRiderId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">-- Select a Rider --</option>
                    {riderList.map(rider => (
                      <option key={rider._id} value={rider._id}>
                        {rider.name} ({rider.phone || 'No phone'})
                      </option>
                    ))}
                  </select>
                )}
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={closeAssignRiderModal}
                  className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 px-4 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignRider}
                  disabled={!selectedRiderId || assigningRider}
                  className={`bg-primary hover:bg-primary-dark dark:bg-primary-dark dark:hover:bg-primary text-white px-4 py-2 rounded-md text-sm font-medium ${
                    !selectedRiderId || assigningRider ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {assigningRider ? 'Assigning...' : 'Assign Rider'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

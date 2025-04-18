import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheckIcon, TruckIcon, CreditCardIcon, UserIcon, Cog6ToothIcon, KeyIcon } from '@heroicons/react/24/outline';

export default function AccountPage() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  if (!currentUser) {
    // Redirect to login if not authenticated
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="bg-white dark:bg-gray-900 w-full">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Account</h1>
        
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
                <Link to="/account" className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary dark:bg-primary-dark rounded-md">
                  <UserIcon className="mr-3 h-5 w-5" aria-hidden="true" />
                  Account Overview
                </Link>
                <Link to="/orders" className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-md">
                  <TruckIcon className="mr-3 h-5 w-5" aria-hidden="true" />
                  Orders
                </Link>
                <Link to="/account/payment" className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-md">
                  <CreditCardIcon className="mr-3 h-5 w-5" aria-hidden="true" />
                  Payment Methods
                </Link>
                <Link to="/account/addresses" className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-md">
                  <ShieldCheckIcon className="mr-3 h-5 w-5" aria-hidden="true" />
                  Addresses
                </Link>
                <Link to="/account/settings" className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-md">
                  <Cog6ToothIcon className="mr-3 h-5 w-5" aria-hidden="true" />
                  Account Settings
                </Link>
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
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Account Overview</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Personal Information</h3>
                    <Link to="/account/edit" className="text-sm text-primary dark:text-primary-light hover:text-primary-dark">Edit</Link>
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-medium text-gray-900 dark:text-white block">Name:</span> 
                      {currentUser.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-medium text-gray-900 dark:text-white block">Email:</span> 
                      {currentUser.email}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-medium text-gray-900 dark:text-white block">Phone:</span> 
                      {currentUser.phone || 'Not provided'}
                    </p>
                  </div>
                </div>
                
                {/* Recent Orders */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Orders</h3>
                    <Link to="/orders" className="text-sm text-primary dark:text-primary-light hover:text-primary-dark">View All</Link>
                  </div>
                  
                  {/* This is a placeholder. In a real app, you'd fetch actual order data */}
                  <p className="text-sm text-gray-600 dark:text-gray-300">No recent orders found.</p>
                </div>
                
                {/* Default Address */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Default Address</h3>
                    <Link to="/account/addresses" className="text-sm text-primary dark:text-primary-light hover:text-primary-dark">Manage</Link>
                  </div>
                  
                  {/* This is a placeholder. In a real app, you'd show the user's default address */}
                  <p className="text-sm text-gray-600 dark:text-gray-300">No default address set.</p>
                </div>
                
                {/* Account Security */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Account Security</h3>
                    <Link to="/account/security" className="text-sm text-primary dark:text-primary-light hover:text-primary-dark">Manage</Link>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium text-gray-900 dark:text-white block">Password:</span> 
                    Last changed: Never
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

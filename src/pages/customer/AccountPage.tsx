import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { TruckIcon, UserIcon, KeyIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';

export default function AccountPage() {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

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

  return (
    <div className="bg-white dark:bg-gray-900 w-full flex flex-col min-h-screen">
      <div className="container mx-auto px-4 py-8 flex-grow">
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
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Account Overview</h2>
              
              <div className="grid grid-cols-1 gap-6">
                {/* Personal Information */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Personal Information</h3>
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
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 shadow-md mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                © {new Date().getFullYear()} Your E-Commerce Store. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light">
                Terms of Service
              </a>
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light">
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

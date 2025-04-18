import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
// Update the import path to be consistent
import { UserRole } from '../types/index';
import { ShoppingCartIcon, UserIcon, Bars3Icon, XMarkIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';

export default function Header() {
  const { currentUser, logout } = useAuth();
  const { totalItems } = useCart();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!currentUser) return '/login';
    
    switch (currentUser.role) {
      case UserRole.ADMIN:
        return '/admin';
      case UserRole.RIDER:
        return '/rider';
      case UserRole.CUSTOMER:
      default:
        return '/account';
    }
  };

  // Determine if the user should see public navigation
  const shouldShowPublicNav = !currentUser || currentUser.role === UserRole.CUSTOMER;

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md w-full">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <span className="text-primary dark:text-primary-light text-xl sm:text-2xl font-bold">Cool<span className="text-primary-dark dark:text-blue-300">Garmi</span></span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-4 lg:space-x-8">
          {shouldShowPublicNav && (
            <>
              <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light transition-colors">Home</Link>
              <Link to="/products" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light transition-colors">Products</Link>
            </>
          )}
          {currentUser && currentUser.role === UserRole.ADMIN && (
            <Link to="/admin/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light transition-colors">Dashboard</Link>
          )}
          {currentUser && currentUser.role === UserRole.RIDER && (
            <Link to="/rider/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light transition-colors">Dashboard</Link>
          )}
        </nav>
        
        {/* User Actions */}
        <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
          {/* Theme toggle button */}
          <button 
            onClick={toggleTheme} 
            className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <SunIcon className="h-6 w-6" />
            ) : (
              <MoonIcon className="h-6 w-6" />
            )}
          </button>
          
          <Link to="/cart" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light transition-colors relative">
            <ShoppingCartIcon className="h-6 w-6" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary dark:bg-primary-dark text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
          
          {currentUser ? (
            <div className="relative group">
              <button className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light flex items-center">
                <UserIcon className="h-6 w-6 mr-1" />
                <span>{currentUser.name.split(' ')[0]}</span>
              </button>
              <div className="absolute right-0 w-48 mt-2 bg-white dark:bg-gray-700 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10">
                <div className="py-1">
                  <Link to={getDashboardLink()} className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-primary-light hover:text-white dark:hover:bg-primary-dark">
                    {currentUser.role === UserRole.ADMIN ? 'Admin Dashboard' : 
                     currentUser.role === UserRole.RIDER ? 'Rider Dashboard' : 'My Account'}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-primary-light hover:text-white dark:hover:bg-primary-dark"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light transition-colors flex items-center">
              <UserIcon className="h-6 w-6 mr-1" />
              <span>Login</span>
            </Link>
          )}
        </div>
        
        {/* Mobile menu button */}
        <div className="flex items-center md:hidden">
          {/* Theme toggle button */}
          <button 
            onClick={toggleTheme} 
            className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light transition-colors mr-4"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <SunIcon className="h-6 w-6" />
            ) : (
              <MoonIcon className="h-6 w-6" />
            )}
          </button>
          
          <Link to="/cart" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light transition-colors relative mr-4">
            <ShoppingCartIcon className="h-6 w-6" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary dark:bg-primary-dark text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
          
          <button 
            className="text-gray-600 dark:text-gray-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden px-4 py-2 pb-4 bg-white dark:bg-gray-800">
          <nav className="flex flex-col space-y-3">
            {shouldShowPublicNav && (
              <>
                <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light transition-colors" onClick={() => setIsMenuOpen(false)}>Home</Link>
                <Link to="/products" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light transition-colors" onClick={() => setIsMenuOpen(false)}>Products</Link>
              </>
            )}
            {currentUser && currentUser.role === UserRole.ADMIN && (
              <Link to="/admin/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light transition-colors" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
            )}
            {currentUser && currentUser.role === UserRole.RIDER && (
              <Link to="/rider/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light transition-colors" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
            )}
            <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
            {currentUser ? (
              <>
                <Link to={getDashboardLink()} className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light transition-colors" onClick={() => setIsMenuOpen(false)}>
                  {currentUser.role === UserRole.ADMIN ? 'Admin Dashboard' : 
                   currentUser.role === UserRole.RIDER ? 'Rider Dashboard' : 'My Account'}
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="text-left text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light transition-colors flex items-center" onClick={() => setIsMenuOpen(false)}>
                <UserIcon className="h-5 w-5 mr-2" />
                <span>Login</span>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

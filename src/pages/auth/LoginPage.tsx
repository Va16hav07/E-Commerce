import { useState, FormEvent, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { Mail, Lock, ArrowLeft, ShoppingBag, Truck, AlertCircle } from 'lucide-react';
import GoogleLoginButton from '../../components/GoogleLoginButton';

interface LocationState {
  from?: string;
  message?: string;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const { login, currentUser, isLoading } = useAuth();
  
  const [activeTab, setActiveTab] = useState<UserRole>(UserRole.CUSTOMER);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [roleMessage, setRoleMessage] = useState('');
  
  // Update role message when role changes
  useEffect(() => {
    if (activeTab === UserRole.ADMIN) {
      setRoleMessage("You're logging in as an Admin. You need admin privileges to access this area.");
    } else if (activeTab === UserRole.RIDER) {
      setRoleMessage("You're logging in as a Rider. You need rider privileges to access this area.");
    } else {
      setRoleMessage('');
    }
  }, [activeTab]);
  
  // Redirect if already logged in
  useEffect(() => {
    if (currentUser && !isLoading) {
      // Redirect based on user role
      if (currentUser.role === UserRole.ADMIN) {
        navigate('/admin/dashboard', { replace: true });
      } else if (currentUser.role === UserRole.RIDER) {
        navigate('/rider/dashboard', { replace: true });
      } else {
        // For customers, redirect to the intended page or home
        navigate(state?.from || '/', { replace: true });
      }
    }
  }, [currentUser, isLoading, navigate, state]);
  
  // Only render the login form if not already authenticated or still loading
  if (isLoading || currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const user = await login(email, password);
      
      // Redirect based on user role
      if (user.role === UserRole.ADMIN) {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.role === UserRole.RIDER) {
        navigate('/rider/dashboard', { replace: true });
      } else {
        // Redirect to the page they were trying to access or home
        const from = location.state?.from || '/';
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to log in. Please check your credentials.');
      console.error(err);
    }
  };
  
  const handleLoginSuccess = () => {
    // Navigate based on user role, handled by AuthContext/effects
  };
  
  const handleLoginFailure = (error: Error) => {
    setError(error.message || 'Google login failed. Please try again.');
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-primary dark:text-primary-light mb-2">CoolGarmi</h1>
          <p className="text-gray-600 dark:text-gray-400">Premium Cooling Solutions</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden p-6">
          {!showRoleSelector ? (
            <>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-medium text-gray-900 dark:text-white">Welcome Back</h2>
                <p className="text-gray-600 dark:text-gray-400">Sign in to your account</p>
              </div>
              
              {state?.message && (
                <div className="mb-6 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 p-3 rounded-md text-center">
                  {state.message}
                </div>
              )}
              
              {error && (
                <div className="mb-6 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-primary dark:focus:ring-primary-light focus:border-primary dark:focus:border-primary-light dark:text-white"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-10 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-primary dark:focus:ring-primary-light focus:border-primary dark:focus:border-primary-light dark:text-white"
                      placeholder="Enter your password"
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary dark:bg-primary-dark text-white font-medium py-3 rounded-md hover:bg-primary-dark dark:hover:bg-primary-dark/90 transition-colors"
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
              
              <div className="mt-4 flex items-center justify-center">
                <div className="border-t border-gray-300 dark:border-gray-600 flex-grow"></div>
                <div className="mx-4 text-gray-500 dark:text-gray-400 text-sm">OR</div>
                <div className="border-t border-gray-300 dark:border-gray-600 flex-grow"></div>
              </div>
              
              {/* Google Login only for customer view */}
              <GoogleLoginButton 
                onSuccess={handleLoginSuccess}
                onFailure={handleLoginFailure}
              />
              
              <div className="text-center mt-4">
                <button 
                  type="button" 
                  className="text-primary dark:text-primary-light hover:underline text-sm"
                  onClick={() => setShowRoleSelector(true)}
                >
                  Not a customer? Login as Admin or Rider
                </button>
              </div>
              
              <div className="mt-6 text-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">Don't have an account?</span>
                <Link to="/signup" className="text-primary dark:text-primary-light hover:underline font-medium ml-1">
                  Sign Up
                </Link>
              </div>
            </>
          ) : (
            // Role selector view
            <>
              <button 
                onClick={() => setShowRoleSelector(false)}
                className="flex items-center text-primary dark:text-primary-light mb-4 hover:underline"
              >
                <ArrowLeft size={18} className="mr-1" /> Back to Customer Login
              </button>
              
              <h2 className="text-xl font-medium mb-4 text-gray-900 dark:text-white">Select Account Type</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <RoleButton
                  role={UserRole.ADMIN}
                  icon={<ShoppingBag size={24} />}
                  selected={activeTab === UserRole.ADMIN}
                  onClick={() => setActiveTab(UserRole.ADMIN)}
                  label="Admin"
                  description="Business management access"
                />
                <RoleButton
                  role={UserRole.RIDER}
                  icon={<Truck size={24} />}
                  selected={activeTab === UserRole.RIDER}
                  onClick={() => setActiveTab(UserRole.RIDER)}
                  label="Rider"
                  description="Delivery personnel access"
                />
              </div>
              
              {roleMessage && (
                <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md flex items-start">
                  <AlertCircle className="text-blue-500 dark:text-blue-400 mr-2 h-5 w-5 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-700 dark:text-blue-400">{roleMessage}</p>
                </div>
              )}
              
              {error && (
                <div className="mb-6 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-primary dark:focus:ring-primary-light focus:border-primary dark:focus:border-primary-light dark:text-white"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-10 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-primary dark:focus:ring-primary-light focus:border-primary dark:focus:border-primary-light dark:text-white"
                      placeholder="Enter your password"
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary dark:bg-primary-dark text-white font-medium py-3 rounded-md hover:bg-primary-dark dark:hover:bg-primary-dark/90 transition-colors mb-3"
                >
                  {isLoading ? 'Signing in...' : `Sign In as ${activeTab}`}
                </button>
              </form>
              
            </>
          )}
        </div>
      </div>
    </div>
  );
}

interface RoleButtonProps {
  role: UserRole;
  icon: React.ReactNode;
  selected: boolean;
  onClick: () => void;
  label: string;
  description: string;
}

const RoleButton: React.FC<RoleButtonProps> = ({ 
  icon, 
  selected, 
  onClick,
  label,
  description
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`p-4 rounded-lg flex flex-col items-center gap-2 transition-all border ${
      selected
        ? 'bg-primary-50 dark:bg-primary-900/30 border-primary dark:border-primary-light text-primary dark:text-primary-light'
        : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
    }`}
  >
    <div className={`p-2 rounded-full ${selected ? 'bg-primary-100 dark:bg-primary-800/50' : 'bg-gray-100 dark:bg-gray-600'}`}>
      {icon}
    </div>
    <span className="text-base font-medium">{label}</span>
    <span className="text-xs text-gray-500 dark:text-gray-400">{description}</span>
  </button>
);

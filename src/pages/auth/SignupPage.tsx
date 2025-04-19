import { useState, FormEvent, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import GoogleLoginButton from '../../components/GoogleLoginButton';

export default function SignupPage() {
  const navigate = useNavigate();
  const { currentUser, isLoading, register } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    
    try {
      setIsSubmitting(true);
      console.log('Starting registration process...');
      await register(name, email, password, phone);
      console.log('Registration successful, navigating to home page');
      navigate('/', { replace: true });
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to create an account.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleGoogleSignupSuccess = () => {
    console.log('Google signup successful');
  };
  
  const handleGoogleSignupFailure = (error: Error) => {
    setError(error.message || 'Google signup failed. Please try again.');
  };
  
  // Redirect if already logged in
  useEffect(() => {
    if (currentUser && !isLoading) {
      // Redirect based on user role
      if (currentUser.role === UserRole.ADMIN) {
        navigate('/admin/dashboard', { replace: true });
      } else if (currentUser.role === UserRole.RIDER) {
        navigate('/rider/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [currentUser, isLoading, navigate]);
  
  // Only render the signup form if not already authenticated or still loading
  if (isLoading || currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-8">
            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
              Create a CoolGarmi Account
            </h2>
            
            {error && (
              <div className="mb-6 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-primary dark:focus:ring-primary-light focus:border-primary dark:focus:border-primary-light dark:text-white"
                  placeholder="Enter your full name"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-primary dark:focus:ring-primary-light focus:border-primary dark:focus:border-primary-light dark:text-white"
                  placeholder="Enter your email"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-primary dark:focus:ring-primary-light focus:border-primary dark:focus:border-primary-light dark:text-white"
                  placeholder="Enter your phone number (optional)"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-primary dark:focus:ring-primary-light focus:border-primary dark:focus:border-primary-light dark:text-white"
                  placeholder="Create a password"
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-primary dark:focus:ring-primary-light focus:border-primary dark:focus:border-primary-light dark:text-white"
                  placeholder="Confirm your password"
                />
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary dark:bg-primary-dark text-white font-medium py-2 rounded-md hover:bg-primary-dark dark:hover:bg-primary-dark/90 transition-colors mb-4 flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></span>
                    Creating account...
                  </>
                ) : (
                  'Sign Up'
                )}
              </button>
            </form>
            
            <div className="mt-4 flex items-center justify-center">
              <div className="border-t border-gray-300 dark:border-gray-600 flex-grow"></div>
              <div className="mx-4 text-gray-500 dark:text-gray-400 text-sm">OR</div>
              <div className="border-t border-gray-300 dark:border-gray-600 flex-grow"></div>
            </div>
            
            {/* Google Signup Button */}
            <GoogleLoginButton
              onSuccess={handleGoogleSignupSuccess}
              onFailure={handleGoogleSignupFailure}
            />
            
            <div className="mt-6 text-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">Already have an account?</span>
              <Link to="/login" className="text-primary dark:text-primary-light hover:text-primary-dark dark:hover:text-primary-light/90 font-medium ml-1">
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

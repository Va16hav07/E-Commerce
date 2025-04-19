import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { handleAuthToken, currentUser, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const processCallback = async () => {
      setProcessing(true);
      
      // Extract token from URL query params
      const query = new URLSearchParams(location.search);
      const token = query.get('token');
      const errorMsg = query.get('error');
      
      console.log('AuthCallback: url search params:', location.search);
      console.log('AuthCallback received:', { 
        token: token ? 'present' : 'missing', 
        error: errorMsg || 'none'
      });
      
      if (errorMsg) {
        console.error('Auth error from redirect:', decodeURIComponent(errorMsg));
        setError(decodeURIComponent(errorMsg));
        setProcessing(false);
        return;
      }
      
      if (token) {
        try {
          console.log('Processing token from callback URL');
          // Process the token through your auth context
          await handleAuthToken(token);
          console.log('Token processing successful');
        } catch (err: any) {
          console.error('Error processing auth callback:', err);
          setError(err.message || 'Authentication failed');
        }
      } else {
        console.log('No token found in callback URL');
        setError('No authentication token received. This may indicate a misconfiguration in your Google OAuth setup.');
      }
      
      setProcessing(false);
    };
    
    // Only process if we have a search string and aren't already logged in
    if (location.search && !currentUser && !isLoading && !processing) {
      processCallback();
    }
  }, [location.search, handleAuthToken, currentUser, isLoading, navigate, processing]);

  useEffect(() => {
    // Handle navigation after auth is complete
    if (!isLoading && !processing) {
      if (currentUser) {
        // Redirect based on user role
        if (currentUser.role === 'ADMIN') {
          navigate('/admin/dashboard', { replace: true });
        } else if (currentUser.role === 'RIDER') {
          navigate('/rider/dashboard', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      } else if (error) {
        // If auth failed
        navigate('/login', { 
          replace: true, 
          state: { message: error || 'Authentication failed. Please try again.' }
        });
      }
    }
  }, [currentUser, isLoading, navigate, error, processing]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center px-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
      <p className="text-gray-600 dark:text-gray-400">Completing authentication...</p>
      {error && (
        <div className="mt-6 max-w-md bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold block mb-1">Authentication Error:</strong>
          <span className="block sm:inline">{error}</span>
          <div className="mt-3">
            <button 
              onClick={() => navigate('/login')}
              className="bg-red-700 hover:bg-red-800 text-white font-medium py-2 px-4 rounded text-sm"
            >
              Return to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

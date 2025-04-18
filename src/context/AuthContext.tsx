import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';
import { User } from '../types';


// Define the AuthContext type
export interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<User>;
  loginWithGoogle: () => Promise<User>;
  signup: (name: string, email: string, password: string, phone?: string) => Promise<User>;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

// Create context with undefined initial value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Check if user is logged in on page load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First check if we have user data in sessionStorage (for page refreshes)
        const storedUser = sessionStorage.getItem('currentUser');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setCurrentUser(parsedUser);
            setIsLoading(false);
            return;
          } catch (parseErr) {
            console.error('Error parsing stored user data:', parseErr);
            sessionStorage.removeItem('currentUser');
          }
        }
        
        // If no sessionStorage data, fall back to token check
        const token = localStorage.getItem('authToken');
        if (!token) {
          setIsLoading(false);
          return;
        }
        
        // Try to get current user details
        const user = await authService.getCurrentUser();
        if (user) {
          setCurrentUser(user as User);
          // Store in sessionStorage for future refreshes
          sessionStorage.setItem('currentUser', JSON.stringify(user));
        }
      } catch (err) {
        console.error('Auth check failed:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  // Login function
  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login(email, password);
      
      // Ensure we have a proper User object
      let user: User;
      if (response && typeof response === 'object') {
        // Check if response is AuthResponse (with user property) or direct User
        if ('user' in response && response.user) {
          user = response.user as User;
        } else {
          user = response as User;
        }
        setCurrentUser(user);
        // Save to sessionStorage to persist across page refreshes
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        return user;
      }
      throw new Error('Invalid response format from login');
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Register function
  const register = async (name: string, email: string, password: string, phone?: string): Promise<User> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.register(name, email, password, phone);
      
      // Ensure we have a proper User object
      let user: User;
      if (response && typeof response === 'object') {
        // Check if response is AuthResponse (with user property) or direct User
        if ('user' in response && response.user) {
          user = response.user as User;
        } else {
          user = response as User;
        }
        setCurrentUser(user);
        // Save to sessionStorage to persist across page refreshes
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        return user;
      }
      throw new Error('Invalid response format from registration');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Google login function
  const loginWithGoogle = async (): Promise<User> => {
    setIsLoading(true);
    setError(null);
    try {
      // For now, just return a redirect to the Google auth endpoint
      window.location.href = authService.initiateGoogleLogin();
      return {} as User; // This won't be reached due to redirect
    } catch (err: any) {
      setError(err.message || 'Google login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Alias register as signup for backward compatibility
  const signup = register;
  
  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
      setCurrentUser(null);
      // Clear the session storage on logout
      sessionStorage.removeItem('currentUser');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };
  
  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      login, 
      register, 
      loginWithGoogle, 
      signup, 
      logout, 
      isLoading, 
      error 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

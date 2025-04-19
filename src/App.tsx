import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { UserRole } from './types/index';

// Layout components
import Layout from './components/Layout';

import RoleRedirect from './components/RoleRedirect'; 

// Pages
import HomePage from './pages/HomePage';
import ProductListingPage from './pages/ProductListingPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import AccountPage from './pages/customer/AccountPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import RiderDashboard from './pages/rider/RiderDashboard';
import OrdersPage from './pages/customer/OrdersPage';
import OrderDetailPage from './pages/customer/OrderDetailPage';
import ContactPage from './pages/ContactPage';
import AuthCallback from './pages/auth/AuthCallback';

// Protected route component
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { currentUser, isLoading } = useAuth();
  
  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // If no user is logged in
  if (!currentUser) {
    // Pass the current location to the login page
    return <Navigate to="/login" state={{ from: window.location.pathname }} replace />;
  }
  
  // If role restriction exists and user doesn't have the required role
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    // Redirect to appropriate dashboard based on role
    if (currentUser.role === UserRole.ADMIN) {
      return <Navigate to="/admin" replace />;
    } else if (currentUser.role === UserRole.RIDER) {
      return <Navigate to="/rider" replace />;
    } else {
      return <Navigate to="/account" replace />;
    }
  }
  
  // If all checks pass, render the children
  return <>{children}</>;
}

// Define route guard components


function App() {
  return (
    <Layout>
      <Routes>
        {/* Public Routes with Role Restrictions */}
        <Route path="/" element={
          <RoleRedirect 
            restrictedRoles={[UserRole.ADMIN, UserRole.RIDER]} 
            redirectPaths={{
              [UserRole.ADMIN]: '/admin/dashboard',
              [UserRole.RIDER]: '/rider/dashboard',
              [UserRole.CUSTOMER]: '/'
            }}
          >
            <HomePage />
          </RoleRedirect>
        } />
        
        {/* Other public routes that should also restrict admin/rider access */}
        <Route path="/products" element={
          <RoleRedirect 
            restrictedRoles={[UserRole.ADMIN, UserRole.RIDER]} 
            redirectPaths={{
              [UserRole.ADMIN]: '/admin/dashboard',
              [UserRole.RIDER]: '/rider/dashboard',
              [UserRole.CUSTOMER]: '/products'
            }}
          >
            <ProductListingPage />
          </RoleRedirect>
        } />
        
        <Route path="/product/:id" element={
          <RoleRedirect 
            restrictedRoles={[UserRole.ADMIN, UserRole.RIDER]} 
            redirectPaths={{
              [UserRole.ADMIN]: '/admin/dashboard',
              [UserRole.RIDER]: '/rider/dashboard',
              [UserRole.CUSTOMER]: '/product/:id'
            }}
          >
            <ProductDetailPage />
          </RoleRedirect>
        } />
        
        <Route path="/cart" element={
          <RoleRedirect 
            restrictedRoles={[UserRole.ADMIN, UserRole.RIDER]} 
            redirectPaths={{
              [UserRole.ADMIN]: '/admin/dashboard',
              [UserRole.RIDER]: '/rider/dashboard',
              [UserRole.CUSTOMER]: '/cart'
            }}
          >
            <CartPage />
          </RoleRedirect>
        } />
        
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        {/* Contact Page - Public Route */}
        <Route path="/contact" element={<ContactPage />} />
        
        {/* Protected Customer Routes */}
        <Route 
          path="/checkout" 
          element={
            <ProtectedRoute allowedRoles={[UserRole.CUSTOMER]}>
              <CheckoutPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/order-success" 
          element={
            <ProtectedRoute allowedRoles={[UserRole.CUSTOMER]}>
              <OrderSuccessPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/account" 
          element={
            <ProtectedRoute allowedRoles={[UserRole.CUSTOMER]}>
              <AccountPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/orders" 
          element={
            <ProtectedRoute allowedRoles={[UserRole.CUSTOMER]}>
              <OrdersPage />
            </ProtectedRoute>
          } 
        />
        <Route path="/orders/:id" element={<OrderDetailPage />} />
        
        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        {/* Add explicit admin dashboard route */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Rider Routes */}
        <Route 
          path="/rider" 
          element={
            <ProtectedRoute allowedRoles={[UserRole.RIDER]}>
              <RiderDashboard />
            </ProtectedRoute>
          } 
        />
        {/* Add explicit rider dashboard route */}
        <Route 
          path="/rider/dashboard" 
          element={
            <ProtectedRoute allowedRoles={[UserRole.RIDER]}>
              <RiderDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route path="/auth/callback" element={<AuthCallback />} />
        
        {/* 404 Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;

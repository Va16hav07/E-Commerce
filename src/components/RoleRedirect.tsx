import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/index';

interface RoleRedirectProps {
  children: React.ReactNode;
  restrictedRoles: UserRole[];
  redirectPaths: Record<UserRole, string>;
}

const RoleRedirect: React.FC<RoleRedirectProps> = ({ 
  children, 
  restrictedRoles, 
  redirectPaths 
}) => {
  const { currentUser, isLoading } = useAuth();

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If no user is logged in, allow access
  if (!currentUser) {
    return <>{children}</>;
  }

  // If user role is restricted, redirect to their designated path
  if (restrictedRoles.includes(currentUser.role)) {
    const redirectPath = redirectPaths[currentUser.role];
    return <Navigate to={redirectPath} replace />;
  }

  // For all other cases, render the children
  return <>{children}</>;
};

export default RoleRedirect;

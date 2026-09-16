import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';

export function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, loading, role } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-900">
        <Loader size="lg" text="Loading..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect to appropriate dashboard based on role
    const roleRoutes = {
      farmer: '/farmer',
      local_admin: '/local-admin',
      super_admin: '/super-admin',
    };
    return <Navigate to={roleRoutes[role] || '/farmer'} replace />;
  }

  return children;
}

export function PublicRoute({ children }) {
  const { isAuthenticated, loading, role } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-900">
        <Loader size="lg" text="Loading..." />
      </div>
    );
  }

  if (isAuthenticated) {
    const roleRoutes = {
      farmer: '/farmer',
      local_admin: '/local-admin',
      super_admin: '/super-admin',
    };
    return <Navigate to={roleRoutes[role] || '/farmer'} replace />;
  }

  return children;
}

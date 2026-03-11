import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();

  // 1. Check for authentication using session-based auth flag
  // Django session auth uses HTTP-only cookies, so we store a flag in localStorage
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  if (!isAuthenticated) {
    // 2. Kick unauthenticated users back to login.
    // The `state={{ from: location }}` part is a pro-tip: it remembers where 
    // they were trying to go, so you can redirect them back there after they log in!
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. If they are authenticated, render the protected component (like the Dashboard)
  return children;
};

export default ProtectedRoute;
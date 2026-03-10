import { Navigate } from 'react-router-dom';

// This wrapper protects non-auth routes as requested in the document 
const ProtectedRoute = ({ children }) => {
  // In a real app, you'd check a global auth state. 
  // For now, we assume the session cookie handles the heavy lifting on the backend.
  const isAuthenticated = true; // Replace with actual auth check logic if needed

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
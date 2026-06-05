import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * ProtectedRoute wraps pages that require authentication
 * 
 * Usage:
 * <ProtectedRoute allowedRoles={['ADMIN']}>
 *   <AdminDashboard />
 * </ProtectedRoute>
 * 
 * If the user is not logged in → redirect to /login
 * If the user doesn't have the right role → redirect to /login
 * If the user is authorized → render the page normally
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth()

  // Don't render anything while we're checking localStorage
  // This prevents a flash of the login page on refresh
  if (loading) return null

  // Not logged in at all
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Logged in but wrong role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />
  }

  // Authorized - render the page
  return children
}

export default ProtectedRoute
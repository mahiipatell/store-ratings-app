import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

// Auth pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// Admin pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminUserList from './pages/admin/UserList'
import AdminStoreList from './pages/admin/StoreList'
import AddUser from './pages/admin/AddUser'

// User pages
import UserStoreList from './pages/user/StoreList'

// Owner pages
import OwnerDashboard from './pages/owner/Dashboard'

// This component redirects users to the right page after login based on their role
const RoleRedirect = () => {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />
  if (user.role === 'USER') return <Navigate to="/stores" replace />
  if (user.role === 'STORE_OWNER') return <Navigate to="/owner/dashboard" replace />

  return <Navigate to="/login" replace />
}

function App() {
  return (
    // AuthProvider wraps everything so all pages have access to auth state
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes - anyone can access */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Root path redirects based on role */}
          <Route path="/" element={<RoleRedirect />} />

          {/* Admin routes - only ADMIN role */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminUserList />
            </ProtectedRoute>
          } />
          <Route path="/admin/stores" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminStoreList />
            </ProtectedRoute>
          } />
          <Route path="/admin/users/add" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AddUser />
            </ProtectedRoute>
          } />

          {/* Normal user routes - only USER role */}
          <Route path="/stores" element={
            <ProtectedRoute allowedRoles={['USER']}>
              <UserStoreList />
            </ProtectedRoute>
          } />

          {/* Store owner routes - only STORE_OWNER role */}
          <Route path="/owner/dashboard" element={
            <ProtectedRoute allowedRoles={['STORE_OWNER']}>
              <OwnerDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
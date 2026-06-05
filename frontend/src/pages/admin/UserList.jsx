import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'

const AdminUserList = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filter state - controlled inputs bound to query params
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' })

  // Sort state
  const [sortBy, setSortBy] = useState('createdAt')
  const [order, setOrder] = useState('desc')

  // Fetch users whenever filters or sort changes
  useEffect(() => {
    fetchUsers()
  }, [sortBy, order])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      // Build query string from filters and sort
      const params = new URLSearchParams()
      if (filters.name) params.append('name', filters.name)
      if (filters.email) params.append('email', filters.email)
      if (filters.address) params.append('address', filters.address)
      if (filters.role) params.append('role', filters.role)
      params.append('sortBy', sortBy)
      params.append('order', order)

      const response = await api.get(`/users?${params.toString()}`)
      setUsers(response.data)
    } catch (err) {
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  // Toggle sort direction or change sort field
  const handleSort = (field) => {
    if (sortBy === field) {
      // Same field clicked — toggle direction
      setOrder(order === 'asc' ? 'desc' : 'asc')
    } else {
      // New field clicked — sort ascending by default
      setSortBy(field)
      setOrder('asc')
    }
  }

  // Shows an arrow indicator next to the active sort column
  const sortIndicator = (field) => {
    if (sortBy !== field) return ' ↕'
    return order === 'asc' ? ' ↑' : ' ↓'
  }

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div style={styles.container}>
      <div style={styles.navbar}>
        <h1 style={styles.navTitle}>Store Ratings — Admin</h1>
        <div style={styles.navLinks}>
          <button style={styles.navBtn} onClick={() => navigate('/admin/dashboard')}>Dashboard</button>
          <button style={styles.navBtn} onClick={() => navigate('/admin/stores')}>Stores</button>
          <button style={styles.navBtn} onClick={() => navigate('/admin/users/add')}>Add User</button>
          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div style={styles.content}>
        <h2 style={styles.heading}>All Users</h2>

        {/* Filter bar */}
        <div style={styles.filterBar}>
          <input
            style={styles.filterInput}
            placeholder="Filter by name"
            value={filters.name}
            onChange={e => setFilters({ ...filters, name: e.target.value })}
          />
          <input
            style={styles.filterInput}
            placeholder="Filter by email"
            value={filters.email}
            onChange={e => setFilters({ ...filters, email: e.target.value })}
          />
          <input
            style={styles.filterInput}
            placeholder="Filter by address"
            value={filters.address}
            onChange={e => setFilters({ ...filters, address: e.target.value })}
          />
          <select
            style={styles.filterInput}
            value={filters.role}
            onChange={e => setFilters({ ...filters, role: e.target.value })}
          >
            <option value="">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="USER">User</option>
            <option value="STORE_OWNER">Store Owner</option>
          </select>
          <button style={styles.filterBtn} onClick={fetchUsers}>Search</button>
          <button style={styles.clearBtn} onClick={() => {
            setFilters({ name: '', email: '', address: '', role: '' })
            setTimeout(fetchUsers, 0)
          }}>Clear</button>
        </div>

        {loading && <p style={styles.info}>Loading users...</p>}
        {error && <p style={styles.error}>{error}</p>}

        {!loading && (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  <th style={styles.th} onClick={() => handleSort('name')}>
                    Name{sortIndicator('name')}
                  </th>
                  <th style={styles.th} onClick={() => handleSort('email')}>
                    Email{sortIndicator('email')}
                  </th>
                  <th style={styles.th} onClick={() => handleSort('address')}>
                    Address{sortIndicator('address')}
                  </th>
                  <th style={styles.th} onClick={() => handleSort('role')}>
                    Role{sortIndicator('role')}
                  </th>
                  <th style={styles.th}>Rating</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} style={styles.tr}>
                    <td style={styles.td}>{user.name}</td>
                    <td style={styles.td}>{user.email}</td>
                    <td style={styles.td}>{user.address}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        backgroundColor:
                          user.role === 'ADMIN' ? '#e9d8fd' :
                          user.role === 'STORE_OWNER' ? '#c6f6d5' : '#bee3f8',
                        color:
                          user.role === 'ADMIN' ? '#6b21a8' :
                          user.role === 'STORE_OWNER' ? '#276749' : '#1a538a'
                      }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {user.role === 'STORE_OWNER'
                        ? (user.averageRating ?? 'No ratings yet')
                        : '—'}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ ...styles.td, textAlign: 'center', color: '#718096' }}>
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f7fafc' },
  navbar: {
    backgroundColor: '#4f46e5', padding: '14px 32px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
  },
  navTitle: { color: '#fff', fontSize: '18px', fontWeight: '700', margin: 0 },
  navLinks: { display: 'flex', gap: '12px', alignItems: 'center' },
  navBtn: {
    backgroundColor: 'transparent', color: '#fff',
    border: '1px solid rgba(255,255,255,0.4)', padding: '6px 14px',
    borderRadius: '6px', cursor: 'pointer', fontSize: '14px'
  },
  logoutBtn: {
    backgroundColor: '#fff', color: '#4f46e5', border: 'none',
    padding: '6px 14px', borderRadius: '6px', cursor: 'pointer',
    fontSize: '14px', fontWeight: '600'
  },
  content: { padding: '32px' },
  heading: { fontSize: '22px', fontWeight: '700', color: '#1a202c', marginBottom: '20px' },
  filterBar: { display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' },
  filterInput: {
    padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0',
    fontSize: '14px', outline: 'none'
  },
  filterBtn: {
    backgroundColor: '#4f46e5', color: '#fff', border: 'none',
    padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px'
  },
  clearBtn: {
    backgroundColor: '#e2e8f0', color: '#4a5568', border: 'none',
    padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px'
  },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden' },
  thead: { backgroundColor: '#f1f5f9' },
  th: {
    padding: '12px 16px', textAlign: 'left', fontSize: '13px',
    fontWeight: '600', color: '#4a5568', cursor: 'pointer', userSelect: 'none',
    borderBottom: '1px solid #e2e8f0'
  },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '12px 16px', fontSize: '14px', color: '#2d3748' },
  badge: { padding: '3px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: '600' },
  info: { color: '#718096' },
  error: { color: '#e53e3e' }
}

export default AdminUserList
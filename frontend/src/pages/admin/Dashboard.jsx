import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'

const AdminDashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // Stats from the backend
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch dashboard stats when the component mounts
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/users/dashboard')
        setStats(response.data)
      } catch (err) {
        setError('Failed to load dashboard stats')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, []) // empty array means run once on mount

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div style={styles.container}>

      {/* Top navbar */}
      <div style={styles.navbar}>
        <h1 style={styles.navTitle}>Store Ratings — Admin</h1>
        <div style={styles.navLinks}>
          <button style={styles.navBtn} onClick={() => navigate('/admin/users')}>Users</button>
          <button style={styles.navBtn} onClick={() => navigate('/admin/stores')}>Stores</button>
          <button style={styles.navBtn} onClick={() => navigate('/admin/users/add')}>Add User</button>
          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div style={styles.content}>
        <h2 style={styles.heading}>Dashboard</h2>
        <p style={styles.welcome}>Welcome, {user?.name}</p>

        {loading && <p style={styles.info}>Loading stats...</p>}
        {error && <p style={styles.error}>{error}</p>}

        {/* Stats cards */}
        {stats && (
          <div style={styles.cards}>
            <div style={styles.card}>
              <p style={styles.cardLabel}>Total Users</p>
              <p style={styles.cardValue}>{stats.totalUsers}</p>
            </div>
            <div style={styles.card}>
              <p style={styles.cardLabel}>Total Stores</p>
              <p style={styles.cardValue}>{stats.totalStores}</p>
            </div>
            <div style={styles.card}>
              <p style={styles.cardLabel}>Total Ratings</p>
              <p style={styles.cardValue}>{stats.totalRatings}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f7fafc' },
  navbar: {
    backgroundColor: '#4f46e5',
    padding: '14px 32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  navTitle: { color: '#fff', fontSize: '18px', fontWeight: '700', margin: 0 },
  navLinks: { display: 'flex', gap: '12px', alignItems: 'center' },
  navBtn: {
    backgroundColor: 'transparent',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.4)',
    padding: '6px 14px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  logoutBtn: {
    backgroundColor: '#fff',
    color: '#4f46e5',
    border: 'none',
    padding: '6px 14px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600'
  },
  content: { padding: '32px' },
  heading: { fontSize: '22px', fontWeight: '700', color: '#1a202c', margin: '0 0 4px 0' },
  welcome: { color: '#718096', marginBottom: '28px', fontSize: '14px' },
  cards: { display: 'flex', gap: '20px', flexWrap: 'wrap' },
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '24px 32px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    minWidth: '160px',
    textAlign: 'center'
  },
  cardLabel: { margin: '0 0 8px 0', color: '#718096', fontSize: '13px', fontWeight: '500' },
  cardValue: { margin: 0, fontSize: '36px', fontWeight: '700', color: '#4f46e5' },
  info: { color: '#718096' },
  error: { color: '#e53e3e' }
}

export default AdminDashboard
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'

const OwnerDashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/stores/owner/dashboard')
        setStores(response.data)
      } catch (err) {
        setError('Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div style={styles.container}>
      <div style={styles.navbar}>
        <h1 style={styles.navTitle}>Store Ratings — Owner</h1>
        <div style={styles.navLinks}>
          <button style={styles.navBtn} onClick={() => navigate('/change-password')}>
            Change Password
          </button>
          <span style={styles.navUser}>👤 {user?.name}</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div style={styles.content}>
        <h2 style={styles.heading}>My Store Dashboard</h2>

        {loading && <p style={styles.info}>Loading dashboard...</p>}
        {error && <p style={styles.error}>{error}</p>}

        {!loading && stores.map(store => (
          <div key={store.id} style={styles.storeSection}>

            {/* Store header with average rating */}
            <div style={styles.storeHeader}>
              <div>
                <h3 style={styles.storeName}>{store.name}</h3>
                <p style={styles.storeAddress}>📍 {store.address}</p>
              </div>
              <div style={styles.avgBox}>
                <p style={styles.avgLabel}>Average Rating</p>
                <p style={styles.avgValue}>
                  {store.averageRating !== null ? `⭐ ${store.averageRating}` : 'No ratings yet'}
                </p>
                <p style={styles.totalRatings}>{store.totalRatings} rating{store.totalRatings !== 1 ? 's' : ''}</p>
              </div>
            </div>

            {/* Table of users who rated */}
            <h4 style={styles.tableTitle}>Users Who Rated This Store</h4>

            {store.ratings.length === 0 ? (
              <p style={styles.info}>No ratings submitted yet</p>
            ) : (
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.thead}>
                      <th style={styles.th}>User Name</th>
                      <th style={styles.th}>Email</th>
                      <th style={styles.th}>Rating</th>
                      <th style={styles.th}>Submitted At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {store.ratings.map(rating => (
                      <tr key={rating.id} style={styles.tr}>
                        <td style={styles.td}>{rating.user.name}</td>
                        <td style={styles.td}>{rating.user.email}</td>
                        <td style={styles.td}>
                          <span style={styles.ratingBadge}>⭐ {rating.value}</span>
                        </td>
                        <td style={styles.td}>
                          {new Date(rating.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}

        {!loading && stores.length === 0 && (
          <p style={styles.info}>No stores assigned to your account yet.</p>
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
  navUser: { color: 'rgba(255,255,255,0.85)', fontSize: '14px' },
  logoutBtn: {
    backgroundColor: '#fff', color: '#4f46e5', border: 'none',
    padding: '6px 14px', borderRadius: '6px', cursor: 'pointer',
    fontSize: '14px', fontWeight: '600'
  },
  content: { padding: '32px' },
  heading: { fontSize: '22px', fontWeight: '700', color: '#1a202c', marginBottom: '24px' },
  storeSection: {
    backgroundColor: '#fff', borderRadius: '12px', padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '24px'
  },
  storeHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: '24px', flexWrap: 'wrap', gap: '16px'
  },
  storeName: { margin: '0 0 4px 0', fontSize: '18px', fontWeight: '700', color: '#1a202c' },
  storeAddress: { margin: 0, color: '#718096', fontSize: '14px' },
  avgBox: {
    backgroundColor: '#f0f4ff', borderRadius: '10px', padding: '16px 24px',
    textAlign: 'center', minWidth: '140px'
  },
  avgLabel: { margin: '0 0 4px 0', fontSize: '12px', color: '#4a5568', fontWeight: '500' },
  avgValue: { margin: '0 0 4px 0', fontSize: '24px', fontWeight: '700', color: '#4f46e5' },
  totalRatings: { margin: 0, fontSize: '12px', color: '#718096' },
  tableTitle: { fontSize: '15px', fontWeight: '600', color: '#4a5568', marginBottom: '12px' },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { backgroundColor: '#f1f5f9' },
  th: {
    padding: '10px 14px', textAlign: 'left', fontSize: '13px',
    fontWeight: '600', color: '#4a5568', borderBottom: '1px solid #e2e8f0'
  },
  tr: { borderBottom: '1px solid #f8f9fa' },
  td: { padding: '10px 14px', fontSize: '14px', color: '#2d3748' },
  ratingBadge: { fontWeight: '600', color: '#d97706' },
  info: { color: '#718096', fontSize: '14px' },
  error: { color: '#e53e3e' }
}

export default OwnerDashboard
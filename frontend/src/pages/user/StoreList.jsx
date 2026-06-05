import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'

const UserStoreList = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Search filters
  const [filters, setFilters] = useState({ name: '', address: '' })

  // Track which store's rating modal is open
  // null means no modal open, a store id means that store's modal is open
  const [ratingModal, setRatingModal] = useState(null)

  // The rating value selected in the modal
  const [selectedRating, setSelectedRating] = useState(0)

  // Track each store's existing rating by the logged in user
  // { storeId: { id, value } }
  const [myRatings, setMyRatings] = useState({})

  const [ratingLoading, setRatingLoading] = useState(false)
  const [ratingError, setRatingError] = useState('')

  // Fetch stores on mount
  useEffect(() => {
    fetchStores()
  }, [])

  const fetchStores = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.name) params.append('name', filters.name)
      if (filters.address) params.append('address', filters.address)

      const response = await api.get(`/stores?${params.toString()}`)
      const storeList = response.data
      setStores(storeList)

      // After fetching stores, fetch the logged in user's rating for each store
      // We run all requests in parallel using Promise.all for efficiency
      const ratingPromises = storeList.map(store =>
        api.get(`/ratings/my-rating/${store.id}`)
          .then(res => ({ storeId: store.id, rating: res.data.rating }))
          .catch(() => ({ storeId: store.id, rating: null }))
      )

      const ratingsResults = await Promise.all(ratingPromises)

      // Convert array to object for easy lookup: { storeId: rating }
      const ratingsMap = {}
      ratingsResults.forEach(({ storeId, rating }) => {
        ratingsMap[storeId] = rating
      })
      setMyRatings(ratingsMap)

    } catch (err) {
      setError('Failed to load stores')
    } finally {
      setLoading(false)
    }
  }

  // Open the rating modal for a specific store
  const openRatingModal = (store) => {
    setRatingModal(store)
    setRatingError('')
    // Pre-fill with existing rating if the user has already rated
    const existing = myRatings[store.id]
    setSelectedRating(existing ? existing.value : 0)
  }

  // Submit or update a rating
  const submitRating = async () => {
    if (selectedRating === 0) {
      setRatingError('Please select a rating between 1 and 5')
      return
    }

    setRatingLoading(true)
    setRatingError('')

    try {
      const existingRating = myRatings[ratingModal.id]

      if (existingRating) {
        // User already rated — update the existing rating
        await api.put(`/ratings/${existingRating.id}`, { value: selectedRating })
      } else {
        // New rating — submit it
        await api.post('/ratings', { storeId: ratingModal.id, value: selectedRating })
      }

      // Close modal and refresh stores to show updated average
      setRatingModal(null)
      fetchStores()

    } catch (err) {
      setRatingError(err.response?.data?.message || 'Failed to submit rating')
    } finally {
      setRatingLoading(false)
    }
  }

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div style={styles.container}>
      <div style={styles.navbar}>
        <h1 style={styles.navTitle}>Store Ratings</h1>
        <div style={styles.navLinks}>
          <span style={styles.navUser}>👤 {user?.name}</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div style={styles.content}>
        <h2 style={styles.heading}>All Stores</h2>

        {/* Search bar */}
        <div style={styles.filterBar}>
          <input
            style={styles.filterInput}
            placeholder="Search by name"
            value={filters.name}
            onChange={e => setFilters({ ...filters, name: e.target.value })}
          />
          <input
            style={styles.filterInput}
            placeholder="Search by address"
            value={filters.address}
            onChange={e => setFilters({ ...filters, address: e.target.value })}
          />
          <button style={styles.filterBtn} onClick={fetchStores}>Search</button>
          <button style={styles.clearBtn} onClick={() => {
            setFilters({ name: '', address: '' })
            setTimeout(fetchStores, 0)
          }}>Clear</button>
        </div>

        {loading && <p style={styles.info}>Loading stores...</p>}
        {error && <p style={styles.error}>{error}</p>}

        {/* Store cards grid */}
        {!loading && (
          <div style={styles.grid}>
            {stores.map(store => {
              const myRating = myRatings[store.id]
              return (
                <div key={store.id} style={styles.card}>
                  <h3 style={styles.storeName}>{store.name}</h3>
                  <p style={styles.storeAddress}>📍 {store.address}</p>
                  <p style={styles.storeEmail}>✉️ {store.email}</p>

                  {/* Overall average rating */}
                  <div style={styles.ratingRow}>
                    <span style={styles.ratingLabel}>Overall Rating:</span>
                    <span style={styles.ratingValue}>
                      {store.averageRating !== null
                        ? `⭐ ${store.averageRating}`
                        : 'No ratings yet'}
                    </span>
                  </div>

                  {/* User's own submitted rating */}
                  <div style={styles.ratingRow}>
                    <span style={styles.ratingLabel}>Your Rating:</span>
                    <span style={{ ...styles.ratingValue, color: myRating ? '#4f46e5' : '#a0aec0' }}>
                      {myRating ? `⭐ ${myRating.value}` : 'Not rated yet'}
                    </span>
                  </div>

                  {/* Rate / Update button */}
                  <button
                    style={styles.rateBtn}
                    onClick={() => openRatingModal(store)}
                  >
                    {myRating ? 'Update Rating' : 'Rate This Store'}
                  </button>
                </div>
              )
            })}

            {stores.length === 0 && (
              <p style={styles.info}>No stores found</p>
            )}
          </div>
        )}
      </div>

      {/* Rating Modal */}
      {ratingModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>
              {myRatings[ratingModal.id] ? 'Update Your Rating' : 'Rate This Store'}
            </h3>
            <p style={styles.modalStoreName}>{ratingModal.name}</p>

            {/* Star selector — 5 clickable stars */}
            <div style={styles.stars}>
              {[1, 2, 3, 4, 5].map(star => (
                <span
                  key={star}
                  style={{
                    ...styles.star,
                    color: star <= selectedRating ? '#f6ad55' : '#e2e8f0',
                    cursor: 'pointer'
                  }}
                  onClick={() => setSelectedRating(star)}
                >
                  ★
                </span>
              ))}
            </div>

            <p style={styles.selectedLabel}>
              {selectedRating > 0 ? `Selected: ${selectedRating} star${selectedRating > 1 ? 's' : ''}` : 'Click a star to rate'}
            </p>

            {ratingError && <p style={styles.ratingError}>{ratingError}</p>}

            <div style={styles.modalActions}>
              <button
                style={styles.submitBtn}
                onClick={submitRating}
                disabled={ratingLoading}
              >
                {ratingLoading ? 'Submitting...' : 'Submit'}
              </button>
              <button
                style={styles.cancelBtn}
                onClick={() => setRatingModal(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
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
  navUser: { color: 'rgba(255,255,255,0.85)', fontSize: '14px' },
  logoutBtn: {
    backgroundColor: '#fff', color: '#4f46e5', border: 'none',
    padding: '6px 14px', borderRadius: '6px', cursor: 'pointer',
    fontSize: '14px', fontWeight: '600'
  },
  content: { padding: '32px' },
  heading: { fontSize: '22px', fontWeight: '700', color: '#1a202c', marginBottom: '20px' },
  filterBar: { display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' },
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
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
  card: {
    backgroundColor: '#fff', borderRadius: '12px', padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '8px'
  },
  storeName: { margin: 0, fontSize: '16px', fontWeight: '700', color: '#1a202c' },
  storeAddress: { margin: 0, fontSize: '13px', color: '#718096' },
  storeEmail: { margin: 0, fontSize: '13px', color: '#718096' },
  ratingRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  ratingLabel: { fontSize: '13px', color: '#4a5568', fontWeight: '500' },
  ratingValue: { fontSize: '13px', fontWeight: '600', color: '#d97706' },
  rateBtn: {
    marginTop: '8px', backgroundColor: '#4f46e5', color: '#fff',
    border: 'none', padding: '8px', borderRadius: '8px',
    cursor: 'pointer', fontSize: '14px', fontWeight: '600'
  },
  modalOverlay: {
    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
  },
  modal: {
    backgroundColor: '#fff', borderRadius: '16px', padding: '32px',
    width: '100%', maxWidth: '360px', textAlign: 'center',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
  },
  modalTitle: { margin: '0 0 8px 0', fontSize: '18px', fontWeight: '700', color: '#1a202c' },
  modalStoreName: { margin: '0 0 20px 0', color: '#718096', fontSize: '14px' },
  stars: { display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '12px' },
  star: { fontSize: '40px', transition: 'color 0.15s' },
  selectedLabel: { fontSize: '14px', color: '#4a5568', marginBottom: '16px' },
  ratingError: { color: '#e53e3e', fontSize: '13px', marginBottom: '12px' },
  modalActions: { display: 'flex', gap: '10px', justifyContent: 'center' },
  submitBtn: {
    backgroundColor: '#4f46e5', color: '#fff', border: 'none',
    padding: '10px 24px', borderRadius: '8px', cursor: 'pointer',
    fontSize: '14px', fontWeight: '600'
  },
  cancelBtn: {
    backgroundColor: '#e2e8f0', color: '#4a5568', border: 'none',
    padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px'
  },
  info: { color: '#718096' },
  error: { color: '#e53e3e' }
}

export default UserStoreList
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'

const AddStore = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  // List of store owners fetched from backend
  // Admin picks one from a dropdown instead of typing a raw UUID
  const [storeOwners, setStoreOwners] = useState([])
  const [ownersLoading, setOwnersLoading] = useState(true)

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  // Fetch all store owners when the page loads
  // so admin can pick from a dropdown instead of manually entering an ID
  useEffect(() => {
    const fetchOwners = async () => {
      try {
        // Filter users by role=STORE_OWNER
        const response = await api.get('/users?role=STORE_OWNER')
        setStoreOwners(response.data)
      } catch (err) {
        console.error('Failed to fetch store owners')
      } finally {
        setOwnersLoading(false)
      }
    }

    fetchOwners()
  }, [])

  const onSubmit = async (data) => {
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      await api.post('/stores', {
        name: data.name,
        email: data.email,
        address: data.address,
        ownerId: data.ownerId  // the selected store owner's UUID
      })

      setSuccess('Store created successfully!')
      reset() // clear the form

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create store')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div style={styles.container}>
      <div style={styles.navbar}>
        <h1 style={styles.navTitle}>Store Ratings — Admin</h1>
        <div style={styles.navLinks}>
          <button style={styles.navBtn} onClick={() => navigate('/admin/dashboard')}>Dashboard</button>
          <button style={styles.navBtn} onClick={() => navigate('/admin/users')}>Users</button>
          <button style={styles.navBtn} onClick={() => navigate('/admin/stores')}>Stores</button>
          <button style={styles.navBtn} onClick={() => navigate('/admin/users/add')}>Add User</button>
          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div style={styles.content}>
        <h2 style={styles.heading}>Add New Store</h2>

        <div style={styles.card}>
          {error && <div style={styles.error}>{error}</div>}
          {success && <div style={styles.success}>{success}</div>}

          <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>

            {/* Store name - 20 to 60 characters */}
            <div style={styles.field}>
              <label style={styles.label}>Store Name</label>
              <input
                style={{
                  ...styles.input,
                  borderColor: errors.name ? '#e53e3e' : '#e2e8f0'
                }}
                type="text"
                placeholder="20-60 characters"
                {...register('name', {
                  required: 'Store name is required',
                  minLength: { value: 20, message: 'Store name must be at least 20 characters' },
                  maxLength: { value: 60, message: 'Store name must be at most 60 characters' }
                })}
              />
              {errors.name && <span style={styles.fieldError}>{errors.name.message}</span>}
            </div>

            {/* Store email */}
            <div style={styles.field}>
              <label style={styles.label}>Store Email</label>
              <input
                style={{
                  ...styles.input,
                  borderColor: errors.email ? '#e53e3e' : '#e2e8f0'
                }}
                type="email"
                placeholder="store@example.com"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Enter a valid email address'
                  }
                })}
              />
              {errors.email && <span style={styles.fieldError}>{errors.email.message}</span>}
            </div>

            {/* Store address */}
            <div style={styles.field}>
              <label style={styles.label}>Address</label>
              <textarea
                style={{
                  ...styles.input,
                  borderColor: errors.address ? '#e53e3e' : '#e2e8f0',
                  resize: 'vertical',
                  minHeight: '80px'
                }}
                placeholder="Max 400 characters"
                {...register('address', {
                  required: 'Address is required',
                  maxLength: { value: 400, message: 'Address must be under 400 characters' }
                })}
              />
              {errors.address && <span style={styles.fieldError}>{errors.address.message}</span>}
            </div>

            {/* Store owner dropdown */}
            <div style={styles.field}>
              <label style={styles.label}>Assign Store Owner</label>
              {ownersLoading ? (
                <p style={styles.info}>Loading store owners...</p>
              ) : storeOwners.length === 0 ? (
                // If no store owners exist yet, prompt the admin to create one first
                <div style={styles.warning}>
                  No store owners found. Please{' '}
                  <span
                    style={styles.link}
                    onClick={() => navigate('/admin/users/add')}
                  >
                    create a store owner
                  </span>{' '}
                  first.
                </div>
              ) : (
                <select
                  style={{
                    ...styles.input,
                    borderColor: errors.ownerId ? '#e53e3e' : '#e2e8f0'
                  }}
                  {...register('ownerId', { required: 'Please select a store owner' })}
                >
                  <option value="">Select a store owner</option>
                  {storeOwners.map(owner => (
                    // Display name and email so admin knows who they're selecting
                    <option key={owner.id} value={owner.id}>
                      {owner.name} — {owner.email}
                    </option>
                  ))}
                </select>
              )}
              {errors.ownerId && <span style={styles.fieldError}>{errors.ownerId.message}</span>}
            </div>

            <button
              type="submit"
              style={{
                ...styles.button,
                opacity: loading || storeOwners.length === 0 ? 0.7 : 1,
                cursor: loading || storeOwners.length === 0 ? 'not-allowed' : 'pointer'
              }}
              // Disable submit if no store owners exist or request is in flight
              disabled={loading || storeOwners.length === 0}
            >
              {loading ? 'Creating...' : 'Create Store'}
            </button>
          </form>
        </div>
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
  card: {
    backgroundColor: '#fff', padding: '32px', borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)', width: '100%', maxWidth: '480px'
  },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '14px', fontWeight: '500', color: '#4a5568' },
  input: {
    padding: '10px 14px', borderRadius: '8px',
    border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none'
  },
  fieldError: { fontSize: '12px', color: '#e53e3e' },
  error: {
    backgroundColor: '#fff5f5', border: '1px solid #fed7d7', color: '#c53030',
    padding: '10px 14px', borderRadius: '8px', fontSize: '14px', marginBottom: '12px'
  },
  success: {
    backgroundColor: '#f0fff4', border: '1px solid #9ae6b4', color: '#276749',
    padding: '10px 14px', borderRadius: '8px', fontSize: '14px', marginBottom: '12px'
  },
  warning: {
    backgroundColor: '#fffbeb', border: '1px solid #fbd38d', color: '#92400e',
    padding: '10px 14px', borderRadius: '8px', fontSize: '14px'
  },
  link: { color: '#4f46e5', cursor: 'pointer', fontWeight: '600', textDecoration: 'underline' },
  button: {
    backgroundColor: '#4f46e5', color: '#fff', padding: '11px',
    borderRadius: '8px', border: 'none', fontSize: '15px',
    fontWeight: '600', marginTop: '4px'
  },
  info: { color: '#718096', fontSize: '14px' }
}

export default AddStore
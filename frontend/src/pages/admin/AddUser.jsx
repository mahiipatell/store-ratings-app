import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'

const AddUser = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      await api.post('/users', {
        name: data.name,
        email: data.email,
        password: data.password,
        address: data.address,
        role: data.role
      })

      setSuccess(`User created successfully!`)
      reset() // clear the form after success

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user')
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
          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div style={styles.content}>
        <h2 style={styles.heading}>Add New User</h2>

        <div style={styles.card}>
          {error && <div style={styles.error}>{error}</div>}
          {success && <div style={styles.success}>{success}</div>}

          <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>

            <div style={styles.field}>
              <label style={styles.label}>Full Name</label>
              <input
                style={{ ...styles.input, borderColor: errors.name ? '#e53e3e' : '#e2e8f0' }}
                type="text"
                placeholder="20-60 characters"
                {...register('name', {
                  required: 'Name is required',
                  minLength: { value: 20, message: 'Name must be at least 20 characters' },
                  maxLength: { value: 60, message: 'Name must be at most 60 characters' }
                })}
              />
              {errors.name && <span style={styles.fieldError}>{errors.name.message}</span>}
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Email</label>
              <input
                style={{ ...styles.input, borderColor: errors.email ? '#e53e3e' : '#e2e8f0' }}
                type="email"
                placeholder="user@example.com"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Enter a valid email'
                  }
                })}
              />
              {errors.email && <span style={styles.fieldError}>{errors.email.message}</span>}
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Address</label>
              <textarea
                style={{
                  ...styles.input, borderColor: errors.address ? '#e53e3e' : '#e2e8f0',
                  resize: 'vertical', minHeight: '80px'
                }}
                placeholder="Max 400 characters"
                {...register('address', {
                  required: 'Address is required',
                  maxLength: { value: 400, message: 'Address must be under 400 characters' }
                })}
              />
              {errors.address && <span style={styles.fieldError}>{errors.address.message}</span>}
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Password</label>
              <input
                style={{ ...styles.input, borderColor: errors.password ? '#e53e3e' : '#e2e8f0' }}
                type="password"
                placeholder="8-16 chars, 1 uppercase, 1 special character"
                {...register('password', {
                  required: 'Password is required',
                  pattern: {
                    value: /^(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$/,
                    message: 'Password must be 8-16 characters with at least one uppercase and one special character'
                  }
                })}
              />
              {errors.password && <span style={styles.fieldError}>{errors.password.message}</span>}
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Role</label>
              <select
                style={{ ...styles.input, borderColor: errors.role ? '#e53e3e' : '#e2e8f0' }}
                {...register('role', { required: 'Role is required' })}
              >
                <option value="">Select a role</option>
                <option value="USER">Normal User</option>
                <option value="STORE_OWNER">Store Owner</option>
                <option value="ADMIN">Admin</option>
              </select>
              {errors.role && <span style={styles.fieldError}>{errors.role.message}</span>}
            </div>

            <button
              type="submit"
              style={{ ...styles.button, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create User'}
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
  content: { padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' },
  heading: { fontSize: '22px', fontWeight: '700', color: '#1a202c', marginBottom: '20px' },
  card: {
    backgroundColor: '#fff', padding: '32px', borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)', width: '100%', maxWidth: '480px'
  },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '14px', fontWeight: '500', color: '#4a5568' },
  input: { padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none' },
  fieldError: { fontSize: '12px', color: '#e53e3e' },
  error: {
    backgroundColor: '#fff5f5', border: '1px solid #fed7d7', color: '#c53030',
    padding: '10px 14px', borderRadius: '8px', fontSize: '14px', marginBottom: '12px'
  },
  success: {
    backgroundColor: '#f0fff4', border: '1px solid #9ae6b4', color: '#276749',
    padding: '10px 14px', borderRadius: '8px', fontSize: '14px', marginBottom: '12px'
  },
  button: {
    backgroundColor: '#4f46e5', color: '#fff', padding: '11px',
    borderRadius: '8px', border: 'none', fontSize: '15px', fontWeight: '600', marginTop: '4px'
  }
}

export default AddUser
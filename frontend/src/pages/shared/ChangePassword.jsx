import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'

const ChangePassword = () => {
  const { user, logout } = useAuth()
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
      // Send current and new password to backend
      await api.put('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      })

      setSuccess('Password changed successfully!')

      // Clear the form after success
      reset()

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => { logout(); navigate('/login') }

  // Go back to the right page depending on the user's role
  const handleBack = () => {
    if (user?.role === 'USER') navigate('/stores')
    else if (user?.role === 'STORE_OWNER') navigate('/owner/dashboard')
    else navigate('/')
  }

  return (
    <div style={styles.container}>
      <div style={styles.navbar}>
        <h1 style={styles.navTitle}>Store Ratings</h1>
        <div style={styles.navLinks}>
          <button style={styles.navBtn} onClick={handleBack}>← Back</button>
          <span style={styles.navUser}>👤 {user?.name}</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div style={styles.content}>
        <h2 style={styles.heading}>Change Password</h2>

        <div style={styles.card}>
          {error && <div style={styles.error}>{error}</div>}
          {success && <div style={styles.success}>{success}</div>}

          <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>

            {/* Current password */}
            <div style={styles.field}>
              <label style={styles.label}>Current Password</label>
              <input
                style={{
                  ...styles.input,
                  borderColor: errors.currentPassword ? '#e53e3e' : '#e2e8f0'
                }}
                type="password"
                placeholder="Enter your current password"
                {...register('currentPassword', {
                  required: 'Current password is required'
                })}
              />
              {errors.currentPassword && (
                <span style={styles.fieldError}>{errors.currentPassword.message}</span>
              )}
            </div>

            {/* New password */}
            <div style={styles.field}>
              <label style={styles.label}>New Password</label>
              <input
                style={{
                  ...styles.input,
                  borderColor: errors.newPassword ? '#e53e3e' : '#e2e8f0'
                }}
                type="password"
                placeholder="8-16 chars, 1 uppercase, 1 special character"
                {...register('newPassword', {
                  required: 'New password is required',
                  pattern: {
                    // Must be 8-16 chars with at least one uppercase and one special character
                    value: /^(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$/,
                    message: 'Password must be 8-16 characters with at least one uppercase letter and one special character'
                  }
                })}
              />
              {errors.newPassword && (
                <span style={styles.fieldError}>{errors.newPassword.message}</span>
              )}
            </div>

            <button
              type="submit"
              style={{
                ...styles.button,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Password'}
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
  navUser: { color: 'rgba(255,255,255,0.85)', fontSize: '14px' },
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
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)', width: '100%', maxWidth: '440px'
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
  button: {
    backgroundColor: '#4f46e5', color: '#fff', padding: '11px',
    borderRadius: '8px', border: 'none', fontSize: '15px',
    fontWeight: '600', marginTop: '4px'
  }
}

export default ChangePassword
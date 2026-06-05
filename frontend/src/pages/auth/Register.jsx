import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import api from '../../api/axios'

const Register = () => {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setError('')
    setLoading(true)

    try {
      await api.post('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
        address: data.address
      })

      // After successful registration, redirect to login
      navigate('/login')

    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.subtitle}>Register as a normal user</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>

          {/* Name field - 20 to 60 characters */}
          <div style={styles.field}>
            <label style={styles.label}>Full Name</label>
            <input
              style={{ ...styles.input, borderColor: errors.name ? '#e53e3e' : '#e2e8f0' }}
              type="text"
              placeholder="Enter your full name (20-60 characters)"
              {...register('name', {
                required: 'Name is required',
                minLength: { value: 20, message: 'Name must be at least 20 characters' },
                maxLength: { value: 60, message: 'Name must be at most 60 characters' }
              })}
            />
            {errors.name && <span style={styles.fieldError}>{errors.name.message}</span>}
          </div>

          {/* Email field */}
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              style={{ ...styles.input, borderColor: errors.email ? '#e53e3e' : '#e2e8f0' }}
              type="email"
              placeholder="you@example.com"
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

          {/* Address field - max 400 characters */}
          <div style={styles.field}>
            <label style={styles.label}>Address</label>
            <textarea
              style={{
                ...styles.input,
                borderColor: errors.address ? '#e53e3e' : '#e2e8f0',
                resize: 'vertical',
                minHeight: '80px'
              }}
              placeholder="Enter your address (max 400 characters)"
              {...register('address', {
                required: 'Address is required',
                maxLength: { value: 400, message: 'Address must be under 400 characters' }
              })}
            />
            {errors.address && <span style={styles.fieldError}>{errors.address.message}</span>}
          </div>

          {/* Password field - 8-16 chars, 1 uppercase, 1 special char */}
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
                  message: 'Password must be 8-16 characters with at least one uppercase letter and one special character'
                }
              })}
            />
            {errors.password && <span style={styles.fieldError}>{errors.password.message}</span>}
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
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={styles.loginText}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>Sign in here</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f7fafc'
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    width: '100%',
    maxWidth: '420px'
  },
  title: {
    margin: '0 0 4px 0',
    fontSize: '24px',
    fontWeight: '700',
    color: '#1a202c',
    textAlign: 'center'
  },
  subtitle: {
    margin: '0 0 24px 0',
    color: '#718096',
    textAlign: 'center',
    fontSize: '14px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#4a5568'
  },
  input: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    outline: 'none'
  },
  fieldError: {
    fontSize: '12px',
    color: '#e53e3e'
  },
  error: {
    backgroundColor: '#fff5f5',
    border: '1px solid #fed7d7',
    color: '#c53030',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '16px'
  },
  button: {
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    padding: '11px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '15px',
    fontWeight: '600',
    marginTop: '4px'
  },
  loginText: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#718096',
    marginTop: '20px'
  },
  link: {
    color: '#4f46e5',
    textDecoration: 'none',
    fontWeight: '500'
  }
}

export default Register
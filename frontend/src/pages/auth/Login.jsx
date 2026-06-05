import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'

const Login = () => {
  // useNavigate lets us redirect the user programmatically after login
  const navigate = useNavigate()

  // Get the login function from our global auth context
  const { login } = useAuth()

  // State to show error messages from the server
  const [error, setError] = useState('')

  // State to show a loading spinner while the request is in flight
  const [loading, setLoading] = useState(false)

  // useForm gives us register (to connect inputs), handleSubmit, and formState
  const { register, handleSubmit, formState: { errors } } = useForm()

  // This function runs when the form is submitted and all validations pass
  const onSubmit = async (data) => {
    setError('')       // clear any previous error
    setLoading(true)   // show loading state

    try {
      // Send login request to our backend
      const response = await api.post('/auth/login', {
        email: data.email,
        password: data.password
      })

      // Store token and user in context + localStorage
      login(response.data.token, response.data.user)

      // Redirect based on role
      const role = response.data.user.role
      if (role === 'ADMIN') navigate('/admin/dashboard')
      else if (role === 'USER') navigate('/stores')
      else if (role === 'STORE_OWNER') navigate('/owner/dashboard')

    } catch (err) {
      // Show the error message from the server, or a generic one
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Store Ratings</h2>
        <p style={styles.subtitle}>Sign in to your account</p>

        {/* Show server error if any */}
        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>

          {/* Email field */}
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              style={{
                ...styles.input,
                borderColor: errors.email ? '#e53e3e' : '#e2e8f0'
              }}
              type="email"
              placeholder="you@example.com"
              // register connects this input to react-hook-form
              // The second argument defines validation rules
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Enter a valid email address'
                }
              })}
            />
            {/* Show validation error below the input */}
            {errors.email && <span style={styles.fieldError}>{errors.email.message}</span>}
          </div>

          {/* Password field */}
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              style={{
                ...styles.input,
                borderColor: errors.password ? '#e53e3e' : '#e2e8f0'
              }}
              type="password"
              placeholder="••••••••"
              {...register('password', {
                required: 'Password is required'
              })}
            />
            {errors.password && <span style={styles.fieldError}>{errors.password.message}</span>}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Link to register page for normal users */}
        <p style={styles.registerText}>
          Don't have an account?{' '}
          <Link to="/register" style={styles.link}>Register here</Link>
        </p>
      </div>
    </div>
  )
}

// Inline styles — we'll keep styling simple for now
// In a real project you'd use Tailwind or a CSS file
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
    outline: 'none',
    transition: 'border-color 0.2s'
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
  registerText: {
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

export default Login
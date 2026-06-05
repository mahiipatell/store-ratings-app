import axios from 'axios'

// Create a custom axios instance with our backend URL as the base
// This means instead of writing the full URL every time:
// axios.get('http://localhost:5000/api/users')
// We just write:
// api.get('/users')
const api = axios.create({
  baseURL: 'http://localhost:5000/api'
})

// Request interceptor - runs before every request is sent
// This automatically attaches the JWT token to every request
// so we don't have to manually add the Authorization header every time
api.interceptors.request.use((config) => {
  // Get the token from localStorage where we store it after login
  const token = localStorage.getItem('token')

  if (token) {
    // Attach token to the Authorization header
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export default api
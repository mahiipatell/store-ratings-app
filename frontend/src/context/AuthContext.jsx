import { createContext, useContext, useState, useEffect } from 'react'

// Create the context object
// This is like creating a "channel" that any component can tune into
const AuthContext = createContext(null)

// AuthProvider wraps the entire app and provides auth state to all children
export const AuthProvider = ({ children }) => {
  // user holds the logged in user's info: { id, name, email, role }
  const [user, setUser] = useState(null)

  // token holds the JWT string
  const [token, setToken] = useState(null)

  // loading prevents the app from rendering before we've checked localStorage
  const [loading, setLoading] = useState(true)

  // On app load, check if there's already a token in localStorage
  // This keeps the user logged in even after a page refresh
  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser)) // localStorage stores strings, so we parse it back
    }

    // Done checking, allow the app to render
    setLoading(false)
  }, [])

  // Called after a successful login
  // Stores token and user in both state and localStorage
  const login = (tokenValue, userData) => {
    localStorage.setItem('token', tokenValue)
    localStorage.setItem('user', JSON.stringify(userData))
    setToken(tokenValue)
    setUser(userData)
  }

  // Called when user clicks logout
  // Clears everything from state and localStorage
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook - instead of writing useContext(AuthContext) everywhere,
// any component can just write: const { user, login, logout } = useAuth()
export const useAuth = () => useContext(AuthContext)
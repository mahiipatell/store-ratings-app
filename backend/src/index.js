const express = require('express')
const cors = require('cors')
require('dotenv').config()

// Import all route modules
const authRoutes = require('./modules/auth/auth.routes')
const userRoutes = require('./modules/users/users.routes')
const storeRoutes = require('./modules/stores/stores.routes')

const app = express()

// Global middlewares
app.use(cors())
app.use(express.json())

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Store Ratings API is running' })
})

// Mount routes
// All auth routes: /api/auth/register, /api/auth/login, etc.
app.use('/api/auth', authRoutes)

// All user routes: /api/users, /api/users/:id, etc.
app.use('/api/users', userRoutes)

// All store routes: /api/stores, /api/stores/:id, etc.
app.use('/api/stores', storeRoutes)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
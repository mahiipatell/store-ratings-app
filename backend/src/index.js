const express = require('express')
const cors = require('cors')
require('dotenv').config()

const authRoutes = require('./modules/auth/auth.routes')
const userRoutes = require('./modules/users/users.routes')
const storeRoutes = require('./modules/stores/stores.routes')
const ratingRoutes = require('./modules/ratings/ratings.routes')

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: 'Store Ratings API is running' })
})

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/stores', storeRoutes)
app.use('/api/ratings', ratingRoutes)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
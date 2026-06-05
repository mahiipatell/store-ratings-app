const express = require('express')
const router = express.Router()
const { getUsers, getUserById, createUser, getDashboard } = require('./users.controller')
const { authenticate, authorize } = require('../../middleware/auth')

// All routes here require the user to be logged in AND be an ADMIN
// authenticate → verifies JWT token
// authorize('ADMIN') → checks the role in the token

// GET /api/users/dashboard - must be before /:id to avoid conflict
router.get('/dashboard', authenticate, authorize('ADMIN'), getDashboard)

// GET /api/users - list all users with optional filters
router.get('/', authenticate, authorize('ADMIN'), getUsers)

// GET /api/users/:id - get single user detail
router.get('/:id', authenticate, authorize('ADMIN'), getUserById)

// POST /api/users - create a new user
router.post('/', authenticate, authorize('ADMIN'), createUser)

module.exports = router
const express = require('express')
const router = express.Router()
const { getStores, getStoreById, createStore, getOwnerDashboard } = require('./stores.controller')
const { authenticate, authorize } = require('../../middleware/auth')

// GET /api/stores/owner/dashboard - store owner only
// Important: this route must be defined BEFORE /:id
// otherwise Express would treat "owner" as an :id parameter
router.get('/owner/dashboard', authenticate, authorize('STORE_OWNER'), getOwnerDashboard)

// GET /api/stores - accessible by logged in users and admins
router.get('/', authenticate, getStores)

// GET /api/stores/:id - accessible by logged in users and admins
router.get('/:id', authenticate, getStoreById)

// POST /api/stores - admin only
router.post('/', authenticate, authorize('ADMIN'), createStore)

module.exports = router
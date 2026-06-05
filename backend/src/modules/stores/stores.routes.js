
const express = require('express')
const router = express.Router()
const { getStores, getStoreById, createStore } = require('./stores.controller')
const { authenticate, authorize } = require('../../middleware/auth')

// GET /api/stores - accessible by logged in users and admins
router.get('/', authenticate, getStores)

// GET /api/stores/:id - accessible by logged in users and admins
router.get('/:id', authenticate, getStoreById)

// POST /api/stores - admin only
router.post('/', authenticate, authorize('ADMIN'), createStore)

module.exports = router
const express = require('express')
const router = express.Router()
const { submitRating, updateRating, getMyRating } = require('./ratings.controller')
const { authenticate, authorize } = require('../../middleware/auth')

// POST /api/ratings - submit a new rating (normal users only)
router.post('/', authenticate, authorize('USER'), submitRating)

// PUT /api/ratings/:id - update an existing rating (normal users only)
router.put('/:id', authenticate, authorize('USER'), updateRating)

// GET /api/ratings/my-rating/:storeId - get logged in user's rating for a store
router.get('/my-rating/:storeId', authenticate, authorize('USER'), getMyRating)

module.exports = router
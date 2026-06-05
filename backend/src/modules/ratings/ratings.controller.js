const prisma = require('../../config/prisma')

/**
 * POST /api/ratings
 * Normal User only - Submit a rating for a store
 */
const submitRating = async (req, res) => {
  try {
    const { storeId, value } = req.body

    // req.user is set by the authenticate middleware
    // It contains the logged in user's id and role from the JWT token
    const userId = req.user.id

    // Validate that storeId and value are provided
    if (!storeId || value === undefined) {
      return res.status(400).json({ message: 'storeId and value are required' })
    }

    // Validate rating value is between 1 and 5
    if (!Number.isInteger(value) || value < 1 || value > 5) {
      return res.status(400).json({ message: 'Rating value must be an integer between 1 and 5' })
    }

    // Check that the store exists before submitting a rating
    const store = await prisma.store.findUnique({ where: { id: storeId } })
    if (!store) {
      return res.status(404).json({ message: 'Store not found' })
    }

    // Check if this user has already rated this store
    // The UNIQUE(userId, storeId) constraint in DB prevents duplicates,
    // but we check here first to give a better error message
    const existingRating = await prisma.rating.findUnique({
      where: {
        // This uses the compound unique key we defined in schema.prisma
        userId_storeId: { userId, storeId }
      }
    })

    if (existingRating) {
      return res.status(400).json({
        message: 'You have already rated this store. Use PUT to update your rating.'
      })
    }

    // Create the new rating
    const rating = await prisma.rating.create({
      data: {
        userId,   // the logged in user
        storeId,  // the store being rated
        value     // the rating value (1-5)
      }
    })

    res.status(201).json({ message: 'Rating submitted successfully', rating })

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

/**
 * PUT /api/ratings/:id
 * Normal User only - Update an existing rating
 */
const updateRating = async (req, res) => {
  try {
    const { id } = req.params  // the rating ID to update
    const { value } = req.body
    const userId = req.user.id // from JWT token

    // Validate new rating value
    if (value === undefined) {
      return res.status(400).json({ message: 'value is required' })
    }

    if (!Number.isInteger(value) || value < 1 || value > 5) {
      return res.status(400).json({ message: 'Rating value must be an integer between 1 and 5' })
    }

    // Find the rating being updated
    const rating = await prisma.rating.findUnique({ where: { id } })

    // Check it exists
    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' })
    }

    // Make sure the logged in user owns this rating
    // A user should never be able to update someone else's rating
    if (rating.userId !== userId) {
      return res.status(403).json({ message: 'You can only update your own ratings' })
    }

    // Update the rating value
    const updatedRating = await prisma.rating.update({
      where: { id },
      data: { value }
    })

    res.json({ message: 'Rating updated successfully', rating: updatedRating })

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

/**
 * GET /api/ratings/my-rating/:storeId
 * Normal User only - Get the logged in user's rating for a specific store
 * This is used by the frontend to show the user's existing rating on a store card
 */
const getMyRating = async (req, res) => {
  try {
    const { storeId } = req.params
    const userId = req.user.id

    const rating = await prisma.rating.findUnique({
      where: {
        userId_storeId: { userId, storeId }
      }
    })

    // If no rating found, return null (user hasn't rated this store yet)
    if (!rating) {
      return res.json({ rating: null })
    }

    res.json({ rating })

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = { submitRating, updateRating, getMyRating }
const prisma = require('../../config/prisma')

/**
 * GET /api/stores
 * Public to normal users, Admin can also access
 * Returns all stores with their average rating
 */
const getStores = async (req, res) => {
  try {
    // Extract filter and sort params
    const { name, address, sortBy = 'createdAt', order = 'desc' } = req.query

    // Build filter object dynamically
    const where = {}

    if (name) {
      where.name = { contains: name, mode: 'insensitive' }
    }

    if (address) {
      where.address = { contains: address, mode: 'insensitive' }
    }

    // Valid sortable fields for stores
    const validSortFields = ['name', 'email', 'address', 'createdAt']
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt'
    const sortOrder = order === 'asc' ? 'asc' : 'desc'

    // Fetch stores along with their ratings
    const stores = await prisma.store.findMany({
      where,
      orderBy: { [sortField]: sortOrder },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        ownerId: true,
        ratings: {
          select: { value: true }
        }
      }
    })

    // Compute average rating for each store
    const storesWithAvg = stores.map(store => {
      const avgRating = store.ratings.length > 0
        ? parseFloat(
            (store.ratings.reduce((sum, r) => sum + r.value, 0) / store.ratings.length).toFixed(2)
          )
        : null

      // Remove raw ratings array, replace with computed average
      const { ratings, ...rest } = store
      return { ...rest, averageRating: avgRating }
    })

    res.json(storesWithAvg)

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

/**
 * GET /api/stores/:id
 * Get a single store's details
 */
const getStoreById = async (req, res) => {
  try {
    const { id } = req.params

    const store = await prisma.store.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        ownerId: true,
        ratings: {
          select: { value: true }
        }
      }
    })

    if (!store) {
      return res.status(404).json({ message: 'Store not found' })
    }

    // Compute average rating
    const avgRating = store.ratings.length > 0
      ? parseFloat(
          (store.ratings.reduce((sum, r) => sum + r.value, 0) / store.ratings.length).toFixed(2)
        )
      : null

    const { ratings, ...rest } = store
    res.json({ ...rest, averageRating: avgRating })

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

/**
 * POST /api/stores
 * Admin only - Create a new store
 */
const createStore = async (req, res) => {
  try {
    const { name, email, address, ownerId } = req.body

    // Validate required fields
    if (!name || !email || !address || !ownerId) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    // Validate name length
    if (name.length < 20 || name.length > 60) {
      return res.status(400).json({ message: 'Store name must be between 20 and 60 characters' })
    }

    // Validate address length
    if (address.length > 400) {
      return res.status(400).json({ message: 'Address must be under 400 characters' })
    }

    // Verify the owner exists and is actually a STORE_OWNER
    const owner = await prisma.user.findUnique({ where: { id: ownerId } })
    if (!owner) {
      return res.status(404).json({ message: 'Owner not found' })
    }
    if (owner.role !== 'STORE_OWNER') {
      return res.status(400).json({ message: 'The specified user is not a Store Owner' })
    }

    // Create the store
    const store = await prisma.store.create({
      data: { name, email, address, ownerId },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        ownerId: true,
        createdAt: true
      }
    })

    res.status(201).json({ message: 'Store created successfully', store })

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

/**
 * GET /api/stores/owner/dashboard
 * Store Owner only - View ratings for their store and average rating
 */
const getOwnerDashboard = async (req, res) => {
  try {
    // req.user.id is the logged in store owner's user ID
    const ownerId = req.user.id

    // Find all stores owned by this store owner
    const stores = await prisma.store.findMany({
      where: { ownerId },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        // Get all ratings for this store, including the user who submitted them
        ratings: {
          select: {
            id: true,
            value: true,
            createdAt: true,
            // Include basic info of the user who submitted the rating
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          // Show most recent ratings first
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    // For each store, compute the average rating and format the response
    const storesWithStats = stores.map(store => {
      // Extract just the rating values for average calculation
      const ratingValues = store.ratings.map(r => r.value)

      // Calculate average rating, null if no ratings yet
      const averageRating = ratingValues.length > 0
        ? parseFloat(
            (ratingValues.reduce((sum, v) => sum + v, 0) / ratingValues.length).toFixed(2)
          )
        : null

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        averageRating,
        totalRatings: store.ratings.length, // total number of ratings submitted
        ratings: store.ratings              // list of users who rated with their values
      }
    })

    res.json(storesWithStats)

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}


module.exports = { getStores, getStoreById, createStore, getOwnerDashboard }
const bcrypt = require('bcryptjs')
const prisma = require('../../config/prisma')

/**
 * GET /api/users
 * Admin only - Get all users with optional filters and sorting
 */
const getUsers = async (req, res) => {
  try {
    // Extract query params for filtering and sorting
    // Example: /api/users?name=john&role=USER&sortBy=name&order=asc
    const { name, email, address, role, sortBy = 'createdAt', order = 'desc' } = req.query

    // Build the filter object dynamically
    // Only add a filter if the query param was actually provided
    const where = {}

    if (name) {
      where.name = {
        contains: name,      // partial match (LIKE '%john%')
        mode: 'insensitive'  // case insensitive
      }
    }

    if (email) {
      where.email = {
        contains: email,
        mode: 'insensitive'
      }
    }

    if (address) {
      where.address = {
        contains: address,
        mode: 'insensitive'
      }
    }

    if (role) {
      where.role = role // exact match: 'ADMIN', 'USER', 'STORE_OWNER'
    }

    // Valid columns we allow sorting by (prevents SQL injection via orderBy)
    const validSortFields = ['name', 'email', 'address', 'role', 'createdAt']
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt'

    // Valid sort directions
    const sortOrder = order === 'asc' ? 'asc' : 'desc'

    // Fetch users from DB with filters and sorting applied
    const users = await prisma.user.findMany({
      where,
      orderBy: { [sortField]: sortOrder },
      select: {
        // Never return passwordHash to the client
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
        // For store owners, also return their average rating
        stores: {
          select: {
            ratings: {
              select: { value: true }
            }
          }
        }
      }
    })

    // For each user, compute average rating if they are a store owner
    const usersWithRating = users.map(user => {
      if (user.role === 'STORE_OWNER') {
        // Flatten all ratings across all stores owned by this user
        const allRatings = user.stores.flatMap(store => store.ratings.map(r => r.value))

        // Calculate average, round to 2 decimal places
        const avgRating = allRatings.length > 0
          ? parseFloat((allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(2))
          : null

        const { stores, ...rest } = user
        return { ...rest, averageRating: avgRating }
      }

      // For non store owners, just remove the stores field
      const { stores, ...rest } = user
      return rest
    })

    res.json(usersWithRating)

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

/**
 * GET /api/users/:id
 * Admin only - Get a single user's details by ID
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
        stores: {
          select: {
            id: true,
            name: true,
            ratings: {
              select: { value: true }
            }
          }
        }
      }
    })

    // If no user found with this ID, return 404
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // If the user is a store owner, compute their average rating
    if (user.role === 'STORE_OWNER') {
      const allRatings = user.stores.flatMap(store => store.ratings.map(r => r.value))
      const avgRating = allRatings.length > 0
        ? parseFloat((allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(2))
        : null

      const { stores, ...rest } = user
        return res.json({ ...rest, averageRating: avgRating })
    }

    // For non store owners, remove the stores field from response
    const { stores, ...rest } = user
    res.json(rest)

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

/**
 * POST /api/users
 * Admin only - Create a new user (any role)
 */
const createUser = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body

    // Validate all required fields are present
    if (!name || !email || !password || !address || !role) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    // Validate name length (requirement: 6-60 chars)
    if (name.length < 6 || name.length > 60) {
      return res.status(400).json({ message: 'Name must be between 6 and 60 characters' })
    }

    // Validate address length (requirement: max 400 chars)
    if (address.length > 400) {
      return res.status(400).json({ message: 'Address must be under 400 characters' })
    }

    // Validate password (requirement: 8-16 chars, 1 uppercase, 1 special char)
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$/
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ message: 'Password must be 8-16 characters with at least one uppercase letter and one special character' })
    }

    // Validate role is one of the allowed values
    const validRoles = ['ADMIN', 'USER', 'STORE_OWNER']
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Role must be ADMIN, USER, or STORE_OWNER' })
    }

    // Check if a user with this email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' })
    }

    // Hash the password before storing it
    const passwordHash = await bcrypt.hash(password, 10)

    // Create the user in the database
    const user = await prisma.user.create({
      data: { name, email, passwordHash, address, role },
      select: {
        // Return the created user but never the password hash
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true
      }
    })

    res.status(201).json({ message: 'User created successfully', user })

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

/**
 * GET /api/users/dashboard
 * Admin only - Get platform statistics
 */
const getDashboard = async (req, res) => {
  try {
    // Run all three count queries in parallel for efficiency
    // Instead of waiting for each one sequentially, they all run at the same time
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      prisma.user.count(),
      prisma.store.count(),
      prisma.rating.count()
    ])

    res.json({ totalUsers, totalStores, totalRatings })

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = { getUsers, getUserById, createUser, getDashboard }
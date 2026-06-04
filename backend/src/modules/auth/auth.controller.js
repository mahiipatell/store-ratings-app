const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const prisma = require('../../config/prisma')

// Register - only for normal users (admins are created by other admins)
const register = async (req, res) => {
  try {
    const { name, email, password, address } = req.body

    // Validate fields
    if (!name || !email || !password || !address) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    if (name.length < 20 || name.length > 60) {
      return res.status(400).json({ message: 'Name must be between 20 and 60 characters' })
    }

    if (address.length > 400) {
      return res.status(400).json({ message: 'Address must be under 400 characters' })
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$/
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ message: 'Password must be 8-16 characters with at least one uppercase letter and one special character' })
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' })
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create the user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        address,
        role: 'USER'
      }
    })

    res.status(201).json({ message: 'Registration successful' })

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Login - for all roles
const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.passwordHash)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Change password - for all logged in users
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$/
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ message: 'New password must be 8-16 characters with at least one uppercase letter and one special character' })
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } })

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' })
    }

    const passwordHash = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash }
    })

    res.json({ message: 'Password updated successfully' })

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = { register, login, changePassword }
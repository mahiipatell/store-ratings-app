const express = require('express')
const router = express.Router()
const { register, login, changePassword } = require('./auth.controller')
const { authenticate } = require('../../middleware/auth')

router.post('/register', register)
router.post('/login', login)
router.put('/change-password', authenticate, changePassword)

module.exports = router
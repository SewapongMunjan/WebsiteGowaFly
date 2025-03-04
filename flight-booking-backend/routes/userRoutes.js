// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// Get user profile (protected route)
router.get('/profile', auth, userController.getUserProfile);

// Update user profile (protected route)
router.put('/profile', auth, userController.updateUserProfile);

// Change password (protected route)
router.put('/change-password', auth, userController.changePassword);

module.exports = router;
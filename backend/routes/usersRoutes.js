const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');

// Register a new user
router.post('/register', userController.registerUser);

// Login user
router.post('/login', userController.loginUser);

// Get current user profile
router.get('/profile', authMiddleware, userController.getUserProfile);

// Update user profile
router.put('/profile', authMiddleware, userController.updateUserProfile);

// Delete user account
router.delete('/delete', authMiddleware, userController.deleteUserAccount);

router.get('/me', authMiddleware, userController.getMe);

// Get all users (Admin only)
router.get('/', authMiddleware, userController.getAllUsers);

module.exports = router;

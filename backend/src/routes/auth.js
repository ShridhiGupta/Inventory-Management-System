const express = require('express');
const router = express.Router();

const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  markNotificationSeen,
  logout
} = require('../controllers/authController');

const {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  markNotificationSeenValidation,
  changePasswordValidation
} = require('../validators/authValidator');

const { authenticate } = require('../middleware/auth');

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// Protected routes
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfileValidation, updateProfile);
router.post(
  '/notifications/mark-seen',
  authenticate,
  markNotificationSeenValidation,
  markNotificationSeen
);
router.put('/change-password', authenticate, changePasswordValidation, changePassword);
router.post('/logout', authenticate, logout);

module.exports = router;

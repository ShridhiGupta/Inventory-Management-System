const { body } = require('express-validator');

// Register validation
const registerValidation = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('role')
    .optional()
    .isIn(['SUPER_ADMIN', 'STORE_ADMIN', 'VENDOR_ADMIN', 'TRANSACTION_ADMIN'])
    .withMessage('Invalid role'),
  
  body('phone')
    .optional()
    .trim()
    .isMobilePhone()
    .withMessage('Please enter a valid phone number'),
  
  body('storeId')
    .optional()
    .isMongoId()
    .withMessage('Invalid store ID'),
  
  body('vendorId')
    .optional()
    .isMongoId()
    .withMessage('Invalid vendor ID')
];

// Login validation
const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Update profile validation
const updateProfileValidation = [
  body('firstName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('First name cannot be empty')
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  
  body('lastName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Last name cannot be empty')
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),
  
  body('phone')
    .optional()
    .trim()
    .isMobilePhone()
    .withMessage('Please enter a valid phone number'),
  
  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar must be a valid URL')
];

// Merge notification alert IDs into user.preferences (DB-backed bell state)
const markNotificationSeenValidation = [
  body('ids')
    .isArray()
    .withMessage('ids must be an array')
    .bail()
    .custom((arr) => arr.length <= 200)
    .withMessage('At most 200 ids per request'),
  body('ids.*')
    .isString()
    .trim()
    .isLength({ min: 1, max: 128 })
    .withMessage('Each id must be a non-empty string (max 128 chars)')
];

// Change password validation
const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
];

module.exports = {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  markNotificationSeenValidation,
  changePasswordValidation
};

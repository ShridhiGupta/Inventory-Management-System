const { body } = require('express-validator');

// Create store validation
const createStoreValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Store name is required')
    .isLength({ max: 100 })
    .withMessage('Store name cannot exceed 100 characters'),
  
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Store code is required')
    .isLength({ min: 2, max: 20 })
    .withMessage('Store code must be between 2 and 20 characters')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Store code must contain only uppercase letters and numbers'),
  
  body('address.street')
    .trim()
    .notEmpty()
    .withMessage('Street address is required'),
  
  body('address.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  
  body('address.state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  
  body('address.country')
    .trim()
    .notEmpty()
    .withMessage('Country is required'),
  
  body('address.zipCode')
    .trim()
    .notEmpty()
    .withMessage('Zip code is required'),
  
  body('manager')
    .isMongoId()
    .withMessage('Invalid manager ID'),
  
  body('contactPhone')
    .trim()
    .notEmpty()
    .withMessage('Contact phone is required')
    .isMobilePhone()
    .withMessage('Please enter a valid phone number'),
  
  body('contactEmail')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  
  body('warehouseId')
    .isMongoId()
    .withMessage('Invalid warehouse ID'),
  
  body('type')
    .optional()
    .isIn(['RETAIL', 'WHOLESALE', 'ONLINE', 'HYBRID'])
    .withMessage('Invalid store type'),
  
  body('operatingHours.monday.open')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Monday opening time must be in HH:MM format'),
  
  body('operatingHours.monday.close')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Monday closing time must be in HH:MM format'),
  
  body('settings.taxRate')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Tax rate must be between 0 and 100'),
  
  body('settings.currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be a 3-character code'),
  
  body('settings.lowStockAlertThreshold')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Low stock alert threshold must be a non-negative integer')
];

// Update store validation
const updateStoreValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Store name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Store name cannot exceed 100 characters'),
  
  body('code')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Store code cannot be empty')
    .isLength({ min: 2, max: 20 })
    .withMessage('Store code must be between 2 and 20 characters')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Store code must contain only uppercase letters and numbers'),
  
  body('address.street')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Street address cannot be empty'),
  
  body('address.city')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('City cannot be empty'),
  
  body('address.state')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('State cannot be empty'),
  
  body('address.country')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Country cannot be empty'),
  
  body('address.zipCode')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Zip code cannot be empty'),
  
  body('manager')
    .optional()
    .isMongoId()
    .withMessage('Invalid manager ID'),
  
  body('contactPhone')
    .optional()
    .trim()
    .isMobilePhone()
    .withMessage('Please enter a valid phone number'),
  
  body('contactEmail')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  
  body('warehouseId')
    .optional()
    .isMongoId()
    .withMessage('Invalid warehouse ID'),
  
  body('type')
    .optional()
    .isIn(['RETAIL', 'WHOLESALE', 'ONLINE', 'HYBRID'])
    .withMessage('Invalid store type'),
  
  body('settings.taxRate')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Tax rate must be between 0 and 100'),
  
  body('settings.currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be a 3-character code'),
  
  body('settings.lowStockAlertThreshold')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Low stock alert threshold must be a non-negative integer')
];

// Transfer stock validation
const transferStockValidation = [
  body('warehouseId')
    .isMongoId()
    .withMessage('Invalid warehouse ID'),
  
  body('storeId')
    .isMongoId()
    .withMessage('Invalid store ID'),
  
  body('productId')
    .isMongoId()
    .withMessage('Invalid product ID'),
  
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1')
];

module.exports = {
  createStoreValidation,
  updateStoreValidation,
  transferStockValidation
};

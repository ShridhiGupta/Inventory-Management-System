const { body } = require('express-validator');

// Create warehouse validation
const createWarehouseValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Warehouse name is required')
    .isLength({ max: 100 })
    .withMessage('Warehouse name cannot exceed 100 characters'),
  
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Warehouse code is required')
    .isLength({ min: 2, max: 20 })
    .withMessage('Warehouse code must be between 2 and 20 characters')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Warehouse code must contain only uppercase letters and numbers'),
  
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
  
  body('capacity')
    .isInt({ min: 1 })
    .withMessage('Capacity must be at least 1'),
  
  body('operatingHours.open')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Opening time must be in HH:MM format'),
  
  body('operatingHours.close')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Closing time must be in HH:MM format')
];

// Update warehouse validation
const updateWarehouseValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Warehouse name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Warehouse name cannot exceed 100 characters'),
  
  body('code')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Warehouse code cannot be empty')
    .isLength({ min: 2, max: 20 })
    .withMessage('Warehouse code must be between 2 and 20 characters')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Warehouse code must contain only uppercase letters and numbers'),
  
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
  
  body('capacity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Capacity must be at least 1')
];

// Stock in validation
const stockInValidation = [
  body('warehouseId')
    .isMongoId()
    .withMessage('Invalid warehouse ID'),
  
  body('productId')
    .isMongoId()
    .withMessage('Invalid product ID'),
  
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  
  body('batchNumber')
    .optional()
    .trim(),
  
  body('expiryDate')
    .optional()
    .isISO8601()
    .withMessage('Expiry date must be a valid date'),
  
  body('location.aisle')
    .optional()
    .trim(),
  
  body('location.rack')
    .optional()
    .trim(),
  
  body('location.shelf')
    .optional()
    .trim(),
  
  body('location.bin')
    .optional()
    .trim()
];

// Stock out validation
const stockOutValidation = [
  body('warehouseId')
    .isMongoId()
    .withMessage('Invalid warehouse ID'),
  
  body('productId')
    .isMongoId()
    .withMessage('Invalid product ID'),
  
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Reason cannot exceed 500 characters')
];

// Transfer stock validation
const transferStockValidation = [
  body('fromWarehouseId')
    .isMongoId()
    .withMessage('Invalid source warehouse ID'),
  
  body('toWarehouseId')
    .isMongoId()
    .withMessage('Invalid destination warehouse ID'),
  
  body('productId')
    .isMongoId()
    .withMessage('Invalid product ID'),
  
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1')
];

module.exports = {
  createWarehouseValidation,
  updateWarehouseValidation,
  stockInValidation,
  stockOutValidation,
  transferStockValidation
};

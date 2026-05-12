const { body } = require('express-validator');

// Create product validation
const createProductValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ max: 100 })
    .withMessage('Product name cannot exceed 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('sku')
    .trim()
    .notEmpty()
    .withMessage('SKU is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('SKU must be between 3 and 50 characters'),
  
  body('barcode')
    .optional()
    .trim(),
  
  body('category')
    .isIn(['ELECTRONICS', 'CLOTHING', 'FOOD', 'FURNITURE', 'BOOKS', 'TOYS', 'SPORTS', 'BEAUTY', 'AUTOMOTIVE', 'OTHER'])
    .withMessage('Invalid category'),
  
  body('brand')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Brand cannot exceed 50 characters'),
  
  body('unit')
    .isIn(['PIECES', 'KG', 'LITERS', 'METERS', 'BOXES', 'PACKETS', 'BOTTLES', 'CANS'])
    .withMessage('Invalid unit'),
  
  body('costPrice')
    .isNumeric()
    .withMessage('Cost price must be a number')
    .isFloat({ min: 0 })
    .withMessage('Cost price cannot be negative'),
  
  body('sellingPrice')
    .isNumeric()
    .withMessage('Selling price must be a number')
    .isFloat({ min: 0 })
    .withMessage('Selling price cannot be negative'),
  
  body('minStockLevel')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum stock level must be a non-negative integer'),
  
  body('maxStockLevel')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Maximum stock level must be a non-negative integer'),
  
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  
  body('vendorId')
    .isMongoId()
    .withMessage('Invalid vendor ID'),
  
  body('warehouseId')
    .optional()
    .isMongoId()
    .withMessage('Invalid warehouse ID'),
  
  body('initialQuantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Initial quantity must be a non-negative integer')
];

// Update product validation
const updateProductValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Product name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Product name cannot exceed 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('sku')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('SKU cannot be empty')
    .isLength({ min: 3, max: 50 })
    .withMessage('SKU must be between 3 and 50 characters'),
  
  body('category')
    .optional()
    .isIn(['ELECTRONICS', 'CLOTHING', 'FOOD', 'FURNITURE', 'BOOKS', 'TOYS', 'SPORTS', 'BEAUTY', 'AUTOMOTIVE', 'OTHER'])
    .withMessage('Invalid category'),
  
  body('brand')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Brand cannot exceed 50 characters'),
  
  body('unit')
    .optional()
    .isIn(['PIECES', 'KG', 'LITERS', 'METERS', 'BOXES', 'PACKETS', 'BOTTLES', 'CANS'])
    .withMessage('Invalid unit'),
  
  body('costPrice')
    .optional()
    .isNumeric()
    .withMessage('Cost price must be a number')
    .isFloat({ min: 0 })
    .withMessage('Cost price cannot be negative'),
  
  body('sellingPrice')
    .optional()
    .isNumeric()
    .withMessage('Selling price must be a number')
    .isFloat({ min: 0 })
    .withMessage('Selling price cannot be negative'),
  
  body('minStockLevel')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum stock level must be a non-negative integer'),
  
  body('maxStockLevel')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Maximum stock level must be a non-negative integer'),
  
  body('vendorId')
    .optional()
    .isMongoId()
    .withMessage('Invalid vendor ID')
];

// Update inventory validation
const updateInventoryValidation = [
  body('productId')
    .isMongoId()
    .withMessage('Invalid product ID'),
  
  body('locationId')
    .isMongoId()
    .withMessage('Invalid location ID'),
  
  body('locationType')
    .isIn(['warehouse', 'store'])
    .withMessage('Location type must be warehouse or store'),
  
  body('quantity')
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
  
  body('operation')
    .isIn(['add', 'subtract', 'set'])
    .withMessage('Operation must be add, subtract, or set')
];

module.exports = {
  createProductValidation,
  updateProductValidation,
  updateInventoryValidation
};

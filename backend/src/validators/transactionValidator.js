const { body } = require('express-validator');

// Create sale validation
const createSaleValidation = [
  body('storeId')
    .isMongoId()
    .withMessage('Invalid store ID'),
  
  body('items')
    .isArray({ min: 1 })
    .withMessage('Items must be a non-empty array'),
  
  body('items.*.productId')
    .isMongoId()
    .withMessage('Invalid product ID'),
  
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  
  body('paymentMethod')
    .isIn(['CASH', 'CARD', 'BANK_TRANSFER', 'CREDIT', 'ONLINE'])
    .withMessage('Invalid payment method'),
  
  body('customerInfo.name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Customer name cannot exceed 100 characters'),
  
  body('customerInfo.email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  
  body('customerInfo.phone')
    .optional()
    .trim()
    .isMobilePhone()
    .withMessage('Please enter a valid phone number')
];

// Create purchase validation
const createPurchaseValidation = [
  body('warehouseId')
    .isMongoId()
    .withMessage('Invalid warehouse ID'),
  
  body('vendorId')
    .isMongoId()
    .withMessage('Invalid vendor ID'),
  
  body('items')
    .isArray({ min: 1 })
    .withMessage('Items must be a non-empty array'),
  
  body('items.*.productId')
    .isMongoId()
    .withMessage('Invalid product ID'),
  
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  
  body('items.*.unitPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Unit price must be a non-negative number'),
  
  body('items.*.batchNumber')
    .optional()
    .trim(),
  
  body('paymentTerms')
    .optional()
    .isIn(['NET_15', 'NET_30', 'NET_45', 'NET_60', 'IMMEDIATE'])
    .withMessage('Invalid payment terms')
];

// Create return validation
const createReturnValidation = [
  body('originalTransactionId')
    .isMongoId()
    .withMessage('Invalid original transaction ID'),
  
  body('items')
    .isArray({ min: 1 })
    .withMessage('Items must be a non-empty array'),
  
  body('items.*.productId')
    .isMongoId()
    .withMessage('Invalid product ID'),
  
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  
  body('reason')
    .trim()
    .notEmpty()
    .withMessage('Return reason is required')
    .isLength({ max: 500 })
    .withMessage('Return reason cannot exceed 500 characters')
];

// Update transaction status validation
const updateTransactionStatusValidation = [
  body('status')
    .optional()
    .isIn(['PENDING', 'COMPLETED', 'CANCELLED', 'PARTIAL'])
    .withMessage('Invalid status'),
  
  body('paymentStatus')
    .optional()
    .isIn(['PENDING', 'PAID', 'PARTIAL', 'OVERDUE'])
    .withMessage('Invalid payment status')
];

module.exports = {
  createSaleValidation,
  createPurchaseValidation,
  createReturnValidation,
  updateTransactionStatusValidation
};

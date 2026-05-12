const { body } = require('express-validator');

// Create employee validation
const createEmployeeValidation = [
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
  
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .isMobilePhone()
    .withMessage('Please enter a valid phone number'),
  
  body('role')
    .isIn(['SUPER_ADMIN', 'STORE_ADMIN', 'VENDOR_ADMIN', 'TRANSACTION_ADMIN', 'STORE_MANAGER', 'WAREHOUSE_MANAGER', 'SALES_ASSOCIATE', 'CASHIER'])
    .withMessage('Invalid role'),
  
  body('position')
    .trim()
    .notEmpty()
    .withMessage('Position is required')
    .isLength({ max: 100 })
    .withMessage('Position cannot exceed 100 characters'),
  
  body('department')
    .optional()
    .isIn(['MANAGEMENT', 'SALES', 'WAREHOUSE', 'FINANCE', 'IT', 'HR'])
    .withMessage('Invalid department'),
  
  body('hireDate')
    .isISO8601()
    .withMessage('Please enter a valid hire date'),
  
  body('salary')
    .isFloat({ min: 0 })
    .withMessage('Salary must be a non-negative number'),
  
  body('storeId')
    .optional()
    .isMongoId()
    .withMessage('Invalid store ID'),
  
  body('warehouseId')
    .optional()
    .isMongoId()
    .withMessage('Invalid warehouse ID'),
  
  body('vendorId')
    .optional()
    .isMongoId()
    .withMessage('Invalid vendor ID'),
  
  body('manager')
    .optional()
    .isMongoId()
    .withMessage('Invalid manager ID'),
  
  body('address.street')
    .optional()
    .trim(),
  
  body('address.city')
    .optional()
    .trim(),
  
  body('address.state')
    .optional()
    .trim(),
  
  body('address.country')
    .optional()
    .trim(),
  
  body('address.zipCode')
    .optional()
    .trim(),
  
  body('emergencyContact.name')
    .optional()
    .trim(),
  
  body('emergencyContact.relationship')
    .optional()
    .trim(),
  
  body('emergencyContact.phone')
    .optional()
    .trim(),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters')
];

// Update employee validation
const updateEmployeeValidation = [
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
  
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  
  body('phone')
    .optional()
    .trim()
    .isMobilePhone()
    .withMessage('Please enter a valid phone number'),
  
  body('role')
    .optional()
    .isIn(['SUPER_ADMIN', 'STORE_ADMIN', 'VENDOR_ADMIN', 'TRANSACTION_ADMIN', 'STORE_MANAGER', 'WAREHOUSE_MANAGER', 'SALES_ASSOCIATE', 'CASHIER'])
    .withMessage('Invalid role'),
  
  body('position')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Position cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Position cannot exceed 100 characters'),
  
  body('department')
    .optional()
    .isIn(['MANAGEMENT', 'SALES', 'WAREHOUSE', 'FINANCE', 'IT', 'HR'])
    .withMessage('Invalid department'),
  
  body('hireDate')
    .optional()
    .isISO8601()
    .withMessage('Please enter a valid hire date'),
  
  body('salary')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Salary must be a non-negative number'),
  
  body('storeId')
    .optional()
    .isMongoId()
    .withMessage('Invalid store ID'),
  
  body('warehouseId')
    .optional()
    .isMongoId()
    .withMessage('Invalid warehouse ID'),
  
  body('vendorId')
    .optional()
    .isMongoId()
    .withMessage('Invalid vendor ID'),
  
  body('manager')
    .optional()
    .isMongoId()
    .withMessage('Invalid manager ID'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters')
];

module.exports = {
  createEmployeeValidation,
  updateEmployeeValidation
};

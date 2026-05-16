const { body } = require('express-validator');

// Create employee validation
const createEmployeeValidation = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ max: 100 })
    .withMessage('Full name cannot exceed 100 characters'),

  body('username')
    .optional()
    .trim(),

  body('employeeCode')
    .optional()
    .trim(),

  body('employeeType')
    .optional()
    .isIn(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'PAYROLL', 'INTERN'])
    .withMessage('Invalid employee type'),

  body('status')
    .optional()
    .isIn(['ACTIVE', 'INACTIVE', 'SUSPENDED'])
    .withMessage('Invalid status'),

  body('firstName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  
  body('lastName')
    .optional()
    .trim()
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
    .isIn([
      'SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF', 'HR', 'CASHIER',
      'STORE_ADMIN', 'VENDOR_ADMIN', 'TRANSACTION_ADMIN', 'STORE_MANAGER', 'WAREHOUSE_MANAGER', 'SALES_ASSOCIATE'
    ])
    .withMessage('Invalid role'),
  
  body('position')
    .optional()
    .trim()
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
  
  body('joiningDate')
    .optional()
    .isISO8601()
    .withMessage('Please enter a valid joining date'),
  
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
  body('fullName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Full name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Full name cannot exceed 100 characters'),

  body('username')
    .optional()
    .trim(),

  body('employeeCode')
    .optional()
    .trim(),

  body('employeeType')
    .optional()
    .isIn(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'PAYROLL', 'INTERN'])
    .withMessage('Invalid employee type'),

  body('status')
    .optional()
    .isIn(['ACTIVE', 'INACTIVE', 'SUSPENDED'])
    .withMessage('Invalid status'),

  body('firstName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  
  body('lastName')
    .optional()
    .trim()
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
    .isIn([
      'SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF', 'HR', 'CASHIER',
      'STORE_ADMIN', 'VENDOR_ADMIN', 'TRANSACTION_ADMIN', 'STORE_MANAGER', 'WAREHOUSE_MANAGER', 'SALES_ASSOCIATE'
    ])
    .withMessage('Invalid role'),
  
  body('position')
    .optional()
    .trim()
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

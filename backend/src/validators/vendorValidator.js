const { body } = require('express-validator');

// Create vendor validation
const createVendorValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Vendor name is required')
    .isLength({ max: 100 })
    .withMessage('Vendor name cannot exceed 100 characters'),
  
  body('contactPerson')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Contact person name cannot exceed 100 characters'),
  
  body('email')
    .optional()
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
  
  body('taxId')
    .optional()
    .trim(),
  
  body('paymentTerms')
    .optional()
    .isIn(['NET_15', 'NET_30', 'NET_45', 'NET_60', 'IMMEDIATE'])
    .withMessage('Invalid payment terms'),
  
  body('rating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Rating must be between 0 and 5'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters')
];

// Update vendor validation
const updateVendorValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Vendor name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Vendor name cannot exceed 100 characters'),
  
  body('contactPerson')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Contact person name cannot exceed 100 characters'),
  
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
  
  body('taxId')
    .optional()
    .trim(),
  
  body('paymentTerms')
    .optional()
    .isIn(['NET_15', 'NET_30', 'NET_45', 'NET_60', 'IMMEDIATE'])
    .withMessage('Invalid payment terms'),
  
  body('rating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Rating must be between 0 and 5'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters')
];

// Update rating validation
const updateRatingValidation = [
  body('rating')
    .isFloat({ min: 0, max: 5 })
    .withMessage('Rating must be between 0 and 5')
];

module.exports = {
  createVendorValidation,
  updateVendorValidation,
  updateRatingValidation
};

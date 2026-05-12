const { body } = require('express-validator');

// Create promotion validation
const createPromotionValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Promotion name is required')
    .isLength({ max: 100 })
    .withMessage('Promotion name cannot exceed 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Promotion code is required')
    .isLength({ min: 3, max: 20 })
    .withMessage('Promotion code must be between 3 and 20 characters')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Promotion code must contain only uppercase letters and numbers'),
  
  body('type')
    .isIn(['PERCENTAGE', 'FIXED_AMOUNT', 'BUY_X_GET_Y', 'FREE_SHIPPING', 'BOGO'])
    .withMessage('Invalid promotion type'),
  
  body('value')
    .isFloat({ min: 0 })
    .withMessage('Promotion value must be a non-negative number'),
  
  body('minimumAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum amount must be a non-negative number'),
  
  body('maximumDiscount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum discount must be a non-negative number'),
  
  body('usageLimit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Usage limit must be at least 1'),
  
  body('userLimit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('User limit must be at least 1'),
  
  body('startDate')
    .isISO8601()
    .withMessage('Please enter a valid start date'),
  
  body('endDate')
    .isISO8601()
    .withMessage('Please enter a valid end date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  
  body('applicableProducts')
    .optional()
    .isArray()
    .withMessage('Applicable products must be an array'),
  
  body('applicableProducts.*')
    .optional()
    .isMongoId()
    .withMessage('Invalid product ID'),
  
  body('applicableCategories')
    .optional()
    .isArray()
    .withMessage('Applicable categories must be an array'),
  
  body('applicableCategories.*')
    .optional()
    .isIn(['ELECTRONICS', 'CLOTHING', 'FOOD', 'FURNITURE', 'BOOKS', 'TOYS', 'SPORTS', 'BEAUTY', 'AUTOMOTIVE', 'OTHER'])
    .withMessage('Invalid category'),
  
  body('applicableStores')
    .optional()
    .isArray()
    .withMessage('Applicable stores must be an array'),
  
  body('applicableStores.*')
    .optional()
    .isMongoId()
    .withMessage('Invalid store ID'),
  
  body('conditions')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Conditions cannot exceed 1000 characters')
];

// Update promotion validation
const updatePromotionValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Promotion name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Promotion name cannot exceed 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('code')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Promotion code cannot be empty')
    .isLength({ min: 3, max: 20 })
    .withMessage('Promotion code must be between 3 and 20 characters')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Promotion code must contain only uppercase letters and numbers'),
  
  body('type')
    .optional()
    .isIn(['PERCENTAGE', 'FIXED_AMOUNT', 'BUY_X_GET_Y', 'FREE_SHIPPING', 'BOGO'])
    .withMessage('Invalid promotion type'),
  
  body('value')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Promotion value must be a non-negative number'),
  
  body('minimumAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum amount must be a non-negative number'),
  
  body('maximumDiscount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum discount must be a non-negative number'),
  
  body('usageLimit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Usage limit must be at least 1'),
  
  body('userLimit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('User limit must be at least 1'),
  
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Please enter a valid start date'),
  
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('Please enter a valid end date'),
  
  body('conditions')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Conditions cannot exceed 1000 characters')
];

// Validate promotion code validation
const validatePromotionCodeValidation = [
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Promotion code is required')
    .isLength({ min: 3, max: 20 })
    .withMessage('Promotion code must be between 3 and 20 characters'),
  
  body('userId')
    .optional()
    .isMongoId()
    .withMessage('Invalid user ID'),
  
  body('cartAmount')
    .isFloat({ min: 0 })
    .withMessage('Cart amount must be a non-negative number'),
  
  body('applicableProducts')
    .optional()
    .isArray()
    .withMessage('Applicable products must be an array')
];

module.exports = {
  createPromotionValidation,
  updatePromotionValidation,
  validatePromotionCodeValidation
};

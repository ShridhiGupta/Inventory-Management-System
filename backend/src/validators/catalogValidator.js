const { body } = require('express-validator');

const createProductValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Product name must be between 1 and 200 characters'),
  
  body('sku')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('SKU must be between 1 and 50 characters')
    .matches(/^[A-Z0-9_-]+$/)
    .withMessage('SKU must contain only uppercase letters, numbers, hyphens, and underscores'),
  
  body('barcode')
    .optional()
    .trim()
    .isLength({ min: 8, max: 20 })
    .withMessage('Barcode must be between 8 and 20 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters'),
  
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isMongoId()
    .withMessage('Invalid category ID'),
  
  body('brand')
    .notEmpty()
    .withMessage('Brand is required')
    .isMongoId()
    .withMessage('Invalid brand ID'),
  
  body('hsnCode')
    .optional()
    .trim()
    .matches(/^[0-9]{4,8}$/)
    .withMessage('HSN code must be 4-8 digits'),
  
  body('gstRate')
    .optional()
    .isIn([0, 5, 12, 18, 28])
    .withMessage('GST rate must be 0, 5, 12, 18, or 28 percent'),
  
  body('pricing.costPrice')
    .isFloat({ min: 0 })
    .withMessage('Cost price must be a positive number'),
  
  body('pricing.sellingPrice')
    .isFloat({ min: 0 })
    .withMessage('Selling price must be a positive number'),
  
  body('pricing.mrp')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('MRP must be a positive number'),
  
  body('inventory.currentStock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Current stock must be a non-negative integer'),
  
  body('inventory.reorderLevel')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Reorder level must be a non-negative integer'),
  
  body('weight.gross')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Gross weight must be a positive number'),
  
  body('weight.net')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Net weight must be a positive number'),
  
  body('dimensions.length')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Length must be a positive number'),
  
  body('dimensions.width')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Width must be a positive number'),
  
  body('dimensions.height')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Height must be a positive number'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('searchKeywords')
    .optional()
    .isArray()
    .withMessage('Search keywords must be an array')
];

const updateProductValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Product name must be between 1 and 200 characters'),
  
  body('sku')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('SKU must be between 1 and 50 characters')
    .matches(/^[A-Z0-9_-]+$/)
    .withMessage('SKU must contain only uppercase letters, numbers, hyphens, and underscores'),
  
  body('barcode')
    .optional()
    .trim()
    .isLength({ min: 8, max: 20 })
    .withMessage('Barcode must be between 8 and 20 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters'),
  
  body('category')
    .optional()
    .isMongoId()
    .withMessage('Invalid category ID'),
  
  body('brand')
    .optional()
    .isMongoId()
    .withMessage('Invalid brand ID'),
  
  body('hsnCode')
    .optional()
    .trim()
    .matches(/^[0-9]{4,8}$/)
    .withMessage('HSN code must be 4-8 digits'),
  
  body('gstRate')
    .optional()
    .isIn([0, 5, 12, 18, 28])
    .withMessage('GST rate must be 0, 5, 12, 18, or 28 percent'),
  
  body('pricing.costPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cost price must be a positive number'),
  
  body('pricing.sellingPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Selling price must be a positive number'),
  
  body('pricing.mrp')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('MRP must be a positive number'),
  
  body('inventory.currentStock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Current stock must be a non-negative integer'),
  
  body('inventory.reorderLevel')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Reorder level must be a non-negative integer'),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'draft', 'discontinued', 'out_of_stock'])
    .withMessage('Invalid product status')
];

module.exports = {
  createProductValidation,
  updateProductValidation
};

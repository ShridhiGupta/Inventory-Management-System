const express = require('express');
const router = express.Router();

const {
  getCatalogDashboard,
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getBrands
} = require('../controllers/catalogController');

const {
  createProductValidation,
  updateProductValidation
} = require('../validators/catalogValidator');

const { authenticate, authorize, requirePermission } = require('../middleware/auth');

// Dashboard
router.get('/dashboard', authenticate, getCatalogDashboard);

// Categories
router.get('/categories', authenticate, getCategories);

// Brands
router.get('/brands', authenticate, getBrands);

// Products
router.get('/products', authenticate, getProducts);
router.get('/products/:id', authenticate, getProduct);
router.post('/products', authenticate, authorize('SUPER_ADMIN', 'STORE_ADMIN', 'VENDOR_ADMIN'), createProductValidation, createProduct);
router.put('/products/:id', authenticate, authorize('SUPER_ADMIN', 'STORE_ADMIN', 'VENDOR_ADMIN'), updateProductValidation, updateProduct);
router.delete('/products/:id', authenticate, authorize('SUPER_ADMIN', 'STORE_ADMIN'), deleteProduct);

module.exports = router;

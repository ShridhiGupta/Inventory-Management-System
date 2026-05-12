const express = require('express');
const router = express.Router();

const {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  updateInventory,
  getLowStockItems,
  getInventoryMovements
} = require('../controllers/inventoryController');

const {
  createProductValidation,
  updateProductValidation,
  updateInventoryValidation
} = require('../validators/inventoryValidator');

const { authenticate, authorize, requirePermission } = require('../middleware/auth');

// Public routes (none for inventory - all require authentication)

// Protected routes
router.get('/products', authenticate, getAllProducts);
router.get('/products/:id', authenticate, getProduct);
router.post('/products', authenticate, authorize('SUPER_ADMIN', 'STORE_ADMIN', 'VENDOR_ADMIN'), createProductValidation, createProduct);
router.put('/products/:id', authenticate, authorize('SUPER_ADMIN', 'STORE_ADMIN', 'VENDOR_ADMIN'), updateProductValidation, updateProduct);
router.delete('/products/:id', authenticate, authorize('SUPER_ADMIN', 'STORE_ADMIN'), deleteProduct);

// Inventory management
router.put('/inventory', authenticate, authorize('SUPER_ADMIN', 'STORE_ADMIN', 'TRANSACTION_ADMIN'), updateInventoryValidation, updateInventory);
router.get('/low-stock', authenticate, getLowStockItems);
router.get('/movements', authenticate, getInventoryMovements);

module.exports = router;

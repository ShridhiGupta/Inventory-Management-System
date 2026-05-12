const express = require('express');
const router = express.Router();

const {
  getAllWarehouses,
  getWarehouse,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  stockIn,
  stockOut,
  transferStock
} = require('../controllers/warehouseController');

const {
  createWarehouseValidation,
  updateWarehouseValidation,
  stockInValidation,
  stockOutValidation,
  transferStockValidation
} = require('../validators/warehouseValidator');

const { authenticate, authorize, requirePermission } = require('../middleware/auth');

// Protected routes
router.get('/', authenticate, getAllWarehouses);
router.get('/:id', authenticate, getWarehouse);
router.post('/', authenticate, authorize('SUPER_ADMIN', 'STORE_ADMIN'), createWarehouseValidation, createWarehouse);
router.put('/:id', authenticate, authorize('SUPER_ADMIN', 'STORE_ADMIN'), updateWarehouseValidation, updateWarehouse);
router.delete('/:id', authenticate, authorize('SUPER_ADMIN'), deleteWarehouse);

// Stock management
router.post('/stock-in', authenticate, authorize('SUPER_ADMIN', 'STORE_ADMIN', 'TRANSACTION_ADMIN'), stockInValidation, stockIn);
router.post('/stock-out', authenticate, authorize('SUPER_ADMIN', 'STORE_ADMIN', 'TRANSACTION_ADMIN'), stockOutValidation, stockOut);
router.post('/transfer', authenticate, authorize('SUPER_ADMIN', 'STORE_ADMIN', 'TRANSACTION_ADMIN'), transferStockValidation, transferStock);

module.exports = router;

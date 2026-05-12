const express = require('express');
const router = express.Router();

const {
  getAllStores,
  getStore,
  createStore,
  updateStore,
  deleteStore,
  transferToStore,
  getStoreAnalytics
} = require('../controllers/storeController');

const {
  createStoreValidation,
  updateStoreValidation,
  transferStockValidation
} = require('../validators/storeValidator');

const { authenticate, authorize, requireStoreAccess } = require('../middleware/auth');

// Protected routes
router.get('/', authenticate, getAllStores);
router.get('/:id', authenticate, getStore);
router.post('/', authenticate, authorize('SUPER_ADMIN', 'STORE_ADMIN'), createStoreValidation, createStore);
router.put('/:id', authenticate, authorize('SUPER_ADMIN', 'STORE_ADMIN'), updateStoreValidation, updateStore);
router.delete('/:id', authenticate, authorize('SUPER_ADMIN'), deleteStore);

// Store operations
router.post('/transfer', authenticate, authorize('SUPER_ADMIN', 'STORE_ADMIN', 'TRANSACTION_ADMIN'), transferStockValidation, transferToStore);
router.get('/:id/analytics', authenticate, requireStoreAccess, getStoreAnalytics);

module.exports = router;

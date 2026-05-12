const express = require('express');
const router = express.Router();

const {
  getAllTransactions,
  getTransaction,
  createSale,
  createPurchase,
  createReturn,
  updateTransactionStatus,
  getTransactionAnalytics
} = require('../controllers/transactionController');

const {
  createSaleValidation,
  createPurchaseValidation,
  createReturnValidation,
  updateTransactionStatusValidation
} = require('../validators/transactionValidator');

const { authenticate, authorize, requireStoreAccess } = require('../middleware/auth');

// Protected routes (static paths before /:id)
router.get('/', authenticate, getAllTransactions);
router.get('/analytics', authenticate, getTransactionAnalytics);
router.get('/:id', authenticate, getTransaction);

// Transaction operations
router.post('/sale', authenticate, authorize('SUPER_ADMIN', 'STORE_ADMIN', 'TRANSACTION_ADMIN'), createSaleValidation, createSale);
router.post('/purchase', authenticate, authorize('SUPER_ADMIN', 'STORE_ADMIN', 'TRANSACTION_ADMIN'), createPurchaseValidation, createPurchase);
router.post('/return', authenticate, authorize('SUPER_ADMIN', 'STORE_ADMIN', 'TRANSACTION_ADMIN'), createReturnValidation, createReturn);
router.put('/:id/status', authenticate, authorize('SUPER_ADMIN', 'STORE_ADMIN', 'TRANSACTION_ADMIN'), updateTransactionStatusValidation, updateTransactionStatus);

module.exports = router;

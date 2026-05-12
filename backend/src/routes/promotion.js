const express = require('express');
const router = express.Router();

const {
  getAllPromotions,
  getPromotion,
  createPromotion,
  updatePromotion,
  deletePromotion,
  validatePromotionCode,
  getActivePromotions
} = require('../controllers/promotionController');

const {
  createPromotionValidation,
  updatePromotionValidation,
  validatePromotionCodeValidation
} = require('../validators/promotionValidator');

const { authenticate, authorize } = require('../middleware/auth');

// Protected routes
router.get('/', authenticate, getAllPromotions);
router.get('/:id', authenticate, getPromotion);
router.post('/', authenticate, authorize('SUPER_ADMIN', 'STORE_ADMIN'), createPromotionValidation, createPromotion);
router.put('/:id', authenticate, authorize('SUPER_ADMIN', 'STORE_ADMIN'), updatePromotionValidation, updatePromotion);
router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'STORE_ADMIN'), deletePromotion);

// Promotion validation and active promotions
router.post('/validate', authenticate, validatePromotionCodeValidation, validatePromotionCode);
router.get('/active', authenticate, getActivePromotions);

module.exports = router;

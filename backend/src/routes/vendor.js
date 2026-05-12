const express = require('express');
const router = express.Router();

const {
  getAllVendors,
  getVendor,
  createVendor,
  updateVendor,
  deleteVendor,
  updateVendorRating,
  getVendorAnalytics
} = require('../controllers/vendorController');

const {
  createVendorValidation,
  updateVendorValidation,
  updateRatingValidation
} = require('../validators/vendorValidator');

const { authenticate, authorize, requireVendorAccess } = require('../middleware/auth');

// Protected routes
router.get('/', authenticate, getAllVendors);
router.get('/:id', authenticate, getVendor);
router.post('/', authenticate, authorize('SUPER_ADMIN', 'STORE_ADMIN'), createVendorValidation, createVendor);
router.put('/:id', authenticate, authorize('SUPER_ADMIN', 'STORE_ADMIN', 'VENDOR_ADMIN'), updateVendorValidation, updateVendor);
router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'STORE_ADMIN'), deleteVendor);

// Vendor specific routes
router.put('/:id/rating', authenticate, authorize('SUPER_ADMIN', 'STORE_ADMIN'), updateRatingValidation, updateVendorRating);
router.get('/:id/analytics', authenticate, requireVendorAccess, getVendorAnalytics);

module.exports = router;

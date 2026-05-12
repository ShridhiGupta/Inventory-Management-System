const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const {
  getOrganizationSettings,
  updateOrganizationSettings,
  getSystemStatus,
  getAccessMatrix
} = require('../controllers/settingsController');
const { authenticate, authorize } = require('../middleware/auth');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }
  next();
};

router.get('/organization', authenticate, getOrganizationSettings);

router.put(
  '/organization',
  authenticate,
  body('general').optional().isObject(),
  body('invoice').optional().isObject(),
  body('theme').optional().isObject(),
  body('system').optional().isObject(),
  body('integrations').optional().isObject(),
  body('security').optional().isObject(),
  body('notificationDefaults').optional().isObject(),
  handleValidation,
  updateOrganizationSettings
);

router.get('/system-status', authenticate, authorize('SUPER_ADMIN'), getSystemStatus);
router.get('/access-matrix', authenticate, getAccessMatrix);

module.exports = router;

const express = require('express');
const router = express.Router();

const { getReportsDashboard } = require('../controllers/reportController');
const { authenticate } = require('../middleware/auth');

router.get('/dashboard', authenticate, getReportsDashboard);

module.exports = router;

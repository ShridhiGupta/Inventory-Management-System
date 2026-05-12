const express = require('express');
const router = express.Router();
const { getAllCustomers } = require('../controllers/customerController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, getAllCustomers);

module.exports = router;

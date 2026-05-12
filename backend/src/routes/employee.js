const express = require('express');
const router = express.Router();

const {
  getAllEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeesByStore,
  getEmployeesByWarehouse,
  updateLastLogin
} = require('../controllers/employeeController');

const {
  createEmployeeValidation,
  updateEmployeeValidation
} = require('../validators/employeeValidator');

const { authenticate, authorize } = require('../middleware/auth');

// Protected routes
router.get('/', authenticate, getAllEmployees);
router.get('/:id', authenticate, getEmployee);
router.post('/', authenticate, authorize('SUPER_ADMIN', 'STORE_ADMIN'), createEmployeeValidation, createEmployee);
router.put('/:id', authenticate, authorize('SUPER_ADMIN', 'STORE_ADMIN'), updateEmployeeValidation, updateEmployee);
router.delete('/:id', authenticate, authorize('SUPER_ADMIN'), deleteEmployee);

// Store and warehouse specific routes
router.get('/store/:storeId', authenticate, getEmployeesByStore);
router.get('/warehouse/:warehouseId', authenticate, getEmployeesByWarehouse);

// Employee management routes
router.put('/:id/last-login', authenticate, updateLastLogin);

module.exports = router;

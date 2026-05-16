const express = require('express');
const router = express.Router();

const {
  getCatalogDashboard,
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getBrands
} = require('../controllers/catalogController');

const extras = require('../controllers/catalogExtrasController');

const {
  createProductValidation,
  updateProductValidation
} = require('../validators/catalogValidator');

const { authenticate, authorize } = require('../middleware/auth');

// Dashboard
router.get('/dashboard', authenticate, getCatalogDashboard);

// Categories (Custom read, full CRUD via extras)
router.get('/categories', authenticate, getCategories);
router.use('/manage/categories', bindCrud(extras.CategoryController));

// Brands (Custom read, full CRUD via extras)
router.get('/brands', authenticate, getBrands);
router.use('/manage/brands', bindCrud(extras.BrandController));

// Products
router.get('/products', authenticate, getProducts);
router.get('/products/:id', authenticate, getProduct);
router.post('/products', authenticate, authorize('SUPER_ADMIN', 'STORE_ADMIN', 'VENDOR_ADMIN'), createProductValidation, createProduct);
router.put('/products/:id', authenticate, authorize('SUPER_ADMIN', 'STORE_ADMIN', 'VENDOR_ADMIN'), updateProductValidation, updateProduct);
router.delete('/products/:id', authenticate, authorize('SUPER_ADMIN', 'STORE_ADMIN'), deleteProduct);

// Helper to bind CRUD factory to a sub-router
const bindCrud = (controller) => {
  const r = express.Router();
  r.get('/', authenticate, controller.getAll);
  r.get('/:id', authenticate, controller.getOne);
  r.post('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), controller.create);
  r.put('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), controller.update);
  r.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), controller.delete);
  return r;
};

router.use('/taxes', bindCrud(extras.TaxController));
router.use('/charges', bindCrud(extras.ChargeController));
router.use('/product-groups', bindCrud(extras.ProductGroupController));
router.use('/services', bindCrud(extras.ServiceController));
router.use('/vouchers', bindCrud(extras.VoucherController));
router.use('/memberships', bindCrud(extras.MembershipController));

module.exports = router;

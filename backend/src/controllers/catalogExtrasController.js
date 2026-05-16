const { createCrudController } = require('./crudFactory');
const Tax = require('../models/Tax');
const Charge = require('../models/Charge');
const ProductGroup = require('../models/ProductGroup');
const Service = require('../models/Service');
const Voucher = require('../models/Voucher');
const Membership = require('../models/Membership');
const Category = require('../models/Category');
const Brand = require('../models/Brand');

module.exports = {
  TaxController: createCrudController(Tax, 'Tax'),
  ChargeController: createCrudController(Charge, 'Charge'),
  ProductGroupController: createCrudController(ProductGroup, 'ProductGroup'),
  ServiceController: createCrudController(Service, 'Service'),
  VoucherController: createCrudController(Voucher, 'Voucher'),
  MembershipController: createCrudController(Membership, 'Membership'),
  CategoryController: createCrudController(Category, 'Category'),
  BrandController: createCrudController(Brand, 'Brand')
};

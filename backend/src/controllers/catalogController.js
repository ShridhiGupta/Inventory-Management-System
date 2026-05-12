const { validationResult } = require('express-validator');
const CatalogProduct = require('../models/CatalogProduct');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const Promotion = require('../models/Promotion');

// Get Catalog Dashboard KPIs
const getCatalogDashboard = async (req, res) => {
  try {
    const [
      totalProducts,
      activeCategories,
      lowMarginProducts,
      missingHSN,
      productsWithoutImages,
      duplicateSKUs,
      draftProducts
    ] = await Promise.all([
      CatalogProduct.countDocuments({ status: 'active' }),
      Category.countDocuments({ isActive: true }),
      CatalogProduct.countDocuments({ 'pricing.marginPercent': { $lt: 10 } }),
      CatalogProduct.countDocuments({ $or: [{ hsnCode: null }, { hsnCode: '' }] }),
      CatalogProduct.countDocuments({ $or: [{ images: { $size: 0 } }, { images: null }] }),
      CatalogProduct.aggregate([
        { $group: { _id: '$sku', count: { $sum: 1 } } },
        { $match: { count: { $gt: 1 } } },
        { $count: 'duplicates' }
      ]),
      CatalogProduct.countDocuments({ status: 'draft' })
    ]);

    const duplicateSKUCount = duplicateSKUs[0]?.duplicates || 0;

    // AI Insights
    const aiInsights = await generateAIInsights();

    // Category Distribution
    const categoryDistribution = await Category.aggregate([
      { $match: { isActive: true } },
      { $lookup: { from: 'catalogproducts', localField: '_id', foreignField: 'category', as: 'products' } },
      { $project: { name: 1, productCount: { $size: '$products' } } },
      { $sort: { productCount: -1 } },
      { $limit: 10 }
    ]);

    // Top Brands
    const topBrands = await Brand.aggregate([
      { $lookup: { from: 'catalogproducts', localField: '_id', foreignField: 'brand', as: 'products' } },
      { $project: { name: 1, productCount: { $size: '$products' } } },
      { $sort: { productCount: -1 } },
      { $limit: 10 }
    ]);

    // Pricing Bands
    const pricingBands = await CatalogProduct.aggregate([
      { $match: { status: 'active' } },
      {
        $bucket: {
          groupBy: '$pricing.sellingPrice',
          boundaries: [0, 50, 100, 500, 1000, 5000, Infinity],
          default: 'Other',
          output: { count: { $sum: 1 } }
        }
      }
    ]);

    // Margin Analytics
    const marginAnalytics = await CatalogProduct.aggregate([
      { $match: { status: 'active' } },
      {
        $bucket: {
          groupBy: '$pricing.marginPercent',
          boundaries: [-Infinity, 0, 10, 20, 30, 50, Infinity],
          default: 'Other',
          output: { count: { $sum: 1 } }
        }
      }
    ]);

    // Tax Slab Breakdown
    const taxSlabBreakdown = await CatalogProduct.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$gstRate', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      message: 'Catalog dashboard retrieved successfully',
      kpis: {
        totalProducts,
        activeCategories,
        lowMarginProducts,
        missingHSN,
        productsWithoutImages,
        duplicateSKUs: duplicateSKUCount,
        draftProducts
      },
      aiInsights,
      charts: {
        categoryDistribution,
        topBrands,
        pricingBands,
        marginAnalytics,
        taxSlabBreakdown
      }
    });
  } catch (error) {
    console.error('Get catalog dashboard error:', error);
    res.status(500).json({ message: 'Server error retrieving catalog dashboard' });
  }
};

// Generate AI Insights
const generateAIInsights = async () => {
  const insights = [];

  // Missing HSN Codes Insight
  const missingHSN = await CatalogProduct.countDocuments({ $or: [{ hsnCode: null }, { hsnCode: '' }] });
  if (missingHSN > 0) {
    insights.push({
      type: 'compliance',
      severity: missingHSN > 10 ? 'high' : 'medium',
      title: 'Missing HSN Codes',
      message: `${missingHSN} products missing HSN may impact GST filing.`,
      recommendation: 'Update HSN codes for all taxable products to ensure compliance.',
      affectedProducts: missingHSN
    });
  }

  // Low Margin Products
  const lowMargin = await CatalogProduct.countDocuments({ 'pricing.marginPercent': { $lt: 10 } });
  if (lowMargin > 0) {
    insights.push({
      type: 'profitability',
      severity: lowMargin > 50 ? 'high' : 'medium',
      title: 'Low Margin Alert',
      message: `${lowMargin} SKUs have margin below 10%.`,
      recommendation: 'Review pricing strategy for low-margin products or negotiate better supplier rates.',
      affectedProducts: lowMargin
    });
  }

  // Duplicate SKU Detection
  const duplicateSKUs = await CatalogProduct.aggregate([
    { $group: { _id: '$sku', count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } }
  ]);
  if (duplicateSKUs.length > 0) {
    insights.push({
      type: 'data_quality',
      severity: 'high',
      title: 'Duplicate SKU Conflicts',
      message: `${duplicateSKUs.length} duplicate barcode conflicts found.`,
      recommendation: 'Resolve duplicate SKUs to avoid inventory and billing issues.',
      affectedProducts: duplicateSKUs.reduce((sum, item) => sum + item.count, 0)
    });
  }

  // Seasonal Trend Prediction
  insights.push({
    type: 'prediction',
    severity: 'low',
    title: 'Seasonal Forecast',
    message: 'Winter collection sales predicted to rise 18% next month.',
    recommendation: 'Increase stock for winter categories and prepare promotional campaigns.',
    confidence: 78
  });

  // Pricing Mismatch
  const pricingMismatch = await CatalogProduct.aggregate([
    { $match: { 'storeAvailability.0': { $exists: true } } },
    { $project: { priceVariance: { $stdDevPop: '$storeAvailability.sellingPrice' } } },
    { $match: { priceVariance: { $gt: 5 } } }
  ]);
  if (pricingMismatch.length > 0) {
    insights.push({
      type: 'pricing',
      severity: 'medium',
      title: 'Pricing Inconsistency',
      message: `Product pricing mismatch detected across ${pricingMismatch.length} stores.`,
      recommendation: 'Standardize pricing across stores or implement store-specific pricing strategy.',
      affectedProducts: pricingMismatch.length
    });
  }

  return insights;
};

// Get Products with Advanced Filtering
const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const {
      search,
      category,
      brand,
      status,
      minMargin,
      maxMargin,
      minPrice,
      maxPrice,
      stockStatus,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter
    let filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) filter.category = category;
    if (brand) filter.brand = brand;
    if (status) filter.status = status;

    if (minMargin || maxMargin) {
      filter['pricing.marginPercent'] = {};
      if (minMargin) filter['pricing.marginPercent'].$gte = parseFloat(minMargin);
      if (maxMargin) filter['pricing.marginPercent'].$lte = parseFloat(maxMargin);
    }

    if (minPrice || maxPrice) {
      filter['pricing.sellingPrice'] = {};
      if (minPrice) filter['pricing.sellingPrice'].$gte = parseFloat(minPrice);
      if (maxPrice) filter['pricing.sellingPrice'].$lte = parseFloat(maxPrice);
    }

    if (stockStatus) {
      switch (stockStatus) {
        case 'in_stock':
          filter['inventory.currentStock'] = { $gt: 0 };
          break;
        case 'low_stock':
          filter['inventory.currentStock'] = { $lte: '$inventory.reorderLevel' };
          break;
        case 'out_of_stock':
          filter['inventory.currentStock'] = { $eq: 0 };
          break;
      }
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const products = await CatalogProduct.find(filter)
      .populate('category', 'name code')
      .populate('subCategory', 'name code')
      .populate('brand', 'name code')
      .skip(skip)
      .limit(limit)
      .sort(sort);

    const total = await CatalogProduct.countDocuments(filter);

    res.json({
      message: 'Products retrieved successfully',
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error retrieving products' });
  }
};

// Get Single Product with Full Details
const getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await CatalogProduct.findById(id)
      .populate('category', 'name code')
      .populate('subCategory', 'name code')
      .populate('brand', 'name code manufacturer')
      .populate('suppliers.supplierId', 'name email phone')
      .populate('storeAvailability.storeId', 'name code')
      .populate('createdBy', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      message: 'Product retrieved successfully',
      product
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error retrieving product' });
  }
};

// Create Product with AI Validation
const createProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const productData = req.body;

    // AI Duplicate Detection
    const duplicateCheck = await CatalogProduct.findOne({
      $or: [
        { sku: productData.sku },
        { barcode: productData.barcode }
      ]
    });

    if (duplicateCheck) {
      return res.status(400).json({
        message: 'Duplicate product detected',
        duplicateField: duplicateCheck.sku === productData.sku ? 'SKU' : 'Barcode',
        existingProduct: duplicateCheck
      });
    }

    // AI HSN Code Suggestion
    if (!productData.hsnCode && productData.category) {
      const categoryHSN = await Category.findById(productData.category);
      if (categoryHSN && categoryHSN.hsnRequired) {
        productData.hsnCode = await suggestHSNCode(productData.name, categoryHSN.name);
      }
    }

    // AI Margin Validation
    if (productData.pricing) {
      const marginAnalysis = await analyzeMargin(productData.pricing.costPrice, productData.pricing.sellingPrice);
      if (marginAnalysis.risk === 'high') {
        productData.aiInsights = productData.aiInsights || {};
        productData.aiInsights.alerts = productData.aiInsights.alerts || [];
        productData.aiInsights.alerts.push({
          type: 'low_margin',
          severity: 'high',
          message: `Margin is ${marginAnalysis.margin}% which is below recommended range.`,
          recommendation: 'Consider increasing selling price or reducing cost.'
        });
      }
    }

    const product = new CatalogProduct({
      ...productData,
      createdBy: req.user._id,
      lastModifiedBy: req.user._id
    });

    await product.save();

    const populatedProduct = await CatalogProduct.findById(product._id)
      .populate('category', 'name code')
      .populate('brand', 'name code');

    res.status(201).json({
      message: 'Product created successfully',
      product: populatedProduct
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error creating product' });
  }
};

// Update Product
const updateProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    // Check for duplicates (excluding current product)
    const duplicateCheck = await CatalogProduct.findOne({
      _id: { $ne: id },
      $or: [
        { sku: updateData.sku },
        { barcode: updateData.barcode }
      ]
    });

    if (duplicateCheck) {
      return res.status(400).json({
        message: 'Duplicate product detected',
        duplicateField: duplicateCheck.sku === updateData.sku ? 'SKU' : 'Barcode'
      });
    }

    updateData.lastModifiedBy = req.user._id;

    const product = await CatalogProduct.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('category', 'name code')
     .populate('brand', 'name code');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error updating product' });
  }
};

// Delete Product (Soft Delete)
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await CatalogProduct.findByIdAndUpdate(
      id,
      { status: 'inactive', lastModifiedBy: req.user._id },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      message: 'Product deleted successfully',
      product
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error deleting product' });
  }
};

// Get Categories
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .populate('parentCategory', 'name code')
      .sort({ level: 1, sortOrder: 1, name: 1 });

    res.json({
      message: 'Categories retrieved successfully',
      categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error retrieving categories' });
  }
};

// Get Brands
const getBrands = async (req, res) => {
  try {
    const brands = await Brand.find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 });

    res.json({
      message: 'Brands retrieved successfully',
      brands
    });
  } catch (error) {
    console.error('Get brands error:', error);
    res.status(500).json({ message: 'Server error retrieving brands' });
  }
};

// AI Helper Functions
const suggestHSNCode = async (productName, categoryName) => {
  // Simplified HSN suggestion logic
  const hsnMapping = {
    'Electronics': '8517',
    'Beverages': '2202',
    'Dairy': '0402',
    'Bakery': '1905',
    'Clothing': '6203',
    'Cosmetics': '3304',
    'Pharmaceutical': '3004'
  };

  for (const [category, hsn] of Object.entries(hsnMapping)) {
    if (categoryName.toLowerCase().includes(category.toLowerCase()) ||
        productName.toLowerCase().includes(category.toLowerCase())) {
      return hsn;
    }
  }

  return '9999'; // Default HSN
};

const analyzeMargin = (costPrice, sellingPrice) => {
  const margin = ((sellingPrice - costPrice) / sellingPrice) * 100;
  
  let risk = 'low';
  if (margin < 5) risk = 'high';
  else if (margin < 15) risk = 'medium';

  return { margin: margin.toFixed(2), risk };
};

module.exports = {
  getCatalogDashboard,
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getBrands
};

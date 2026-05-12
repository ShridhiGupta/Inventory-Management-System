const { validationResult } = require('express-validator');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const Vendor = require('../models/Vendor');

// Get all products with inventory
const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const { search, category, vendor, lowStock } = req.query;
    
    // Build filter
    let filter = { isActive: true };
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      filter.category = category;
    }
    
    if (vendor) {
      filter.vendorId = vendor;
    }
    
    const products = await Product.find(filter)
      .populate('vendorId', 'name email phone')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    // Get inventory for each product
    const productsWithInventory = await Promise.all(
      products.map(async (product) => {
        const inventory = await Inventory.find({ productId: product._id })
          .populate('warehouseId', 'name code')
          .populate('storeId', 'name code');
        
        return {
          ...product.toObject(),
          inventory
        };
      })
    );
    
    const total = await Product.countDocuments(filter);
    
    res.json({
      message: 'Products retrieved successfully',
      products: productsWithInventory,
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

// Get single product with inventory
const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findById(id)
      .populate('vendorId', 'name email phone address');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const inventory = await Inventory.find({ productId: id })
      .populate('warehouseId', 'name code')
      .populate('storeId', 'name code');
    
    res.json({
      message: 'Product retrieved successfully',
      product: {
        ...product.toObject(),
        inventory
      }
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error retrieving product' });
  }
};

// Create new product
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
    
    // Check if SKU already exists
    const existingProduct = await Product.findOne({ sku: productData.sku });
    if (existingProduct) {
      return res.status(400).json({ message: 'Product with this SKU already exists' });
    }
    
    // Create product
    const product = new Product(productData);
    await product.save();
    
    // Create inventory record if warehouse or store is provided
    if (productData.warehouseId) {
      const inventory = new Inventory({
        productId: product._id,
        warehouseId: productData.warehouseId,
        quantity: productData.initialQuantity || 0,
        costPerUnit: productData.costPrice
      });
      await inventory.save();
    }
    
    const populatedProduct = await Product.findById(product._id)
      .populate('vendorId', 'name email phone');
    
    res.status(201).json({
      message: 'Product created successfully',
      product: populatedProduct
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error creating product' });
  }
};

// Update product
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
    
    // Check if SKU is being updated and if it already exists
    if (updateData.sku) {
      const existingProduct = await Product.findOne({ 
        sku: updateData.sku,
        _id: { $ne: id }
      });
      if (existingProduct) {
        return res.status(400).json({ message: 'Product with this SKU already exists' });
      }
    }
    
    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('vendorId', 'name email phone');
    
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

// Delete product (soft delete)
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findByIdAndUpdate(
      id,
      { isActive: false },
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

// Update inventory
const updateInventory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { productId, locationId, locationType, quantity, operation } = req.body;
    
    // Find existing inventory record
    let inventory;
    if (locationType === 'warehouse') {
      inventory = await Inventory.findOne({ 
        productId, 
        warehouseId: locationId,
        storeId: null 
      });
    } else {
      inventory = await Inventory.findOne({ 
        productId, 
        storeId: locationId,
        warehouseId: null 
      });
    }
    
    if (!inventory) {
      // Create new inventory record
      inventory = new Inventory({
        productId,
        [locationType === 'warehouse' ? 'warehouseId' : 'storeId']: locationId,
        quantity: 0,
        costPerUnit: 0
      });
    }
    
    // Update quantity based on operation
    if (operation === 'add') {
      inventory.quantity += quantity;
    } else if (operation === 'subtract') {
      inventory.quantity = Math.max(0, inventory.quantity - quantity);
    } else if (operation === 'set') {
      inventory.quantity = quantity;
    }
    
    await inventory.save();
    
    const populatedInventory = await Inventory.findById(inventory._id)
      .populate('productId', 'name sku')
      .populate('warehouseId', 'name code')
      .populate('storeId', 'name code');
    
    res.json({
      message: 'Inventory updated successfully',
      inventory: populatedInventory
    });
  } catch (error) {
    console.error('Update inventory error:', error);
    res.status(500).json({ message: 'Server error updating inventory' });
  }
};

// Get low stock items
const getLowStockItems = async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 20;
    
    const lowStockItems = await Inventory.checkLowStock(threshold);
    
    res.json({
      message: 'Low stock items retrieved successfully',
      items: lowStockItems,
      threshold
    });
  } catch (error) {
    console.error('Get low stock items error:', error);
    res.status(500).json({ message: 'Server error retrieving low stock items' });
  }
};

// Get inventory movements
const getInventoryMovements = async (req, res) => {
  try {
    const { productId, locationId, startDate, endDate } = req.query;
    
    // Build filter
    let filter = {};
    
    if (productId) {
      filter.productId = productId;
    }
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    
    const movements = await Inventory.find(filter)
      .populate('productId', 'name sku')
      .populate('warehouseId', 'name code')
      .populate('storeId', 'name code')
      .sort({ createdAt: -1 });
    
    res.json({
      message: 'Inventory movements retrieved successfully',
      movements
    });
  } catch (error) {
    console.error('Get inventory movements error:', error);
    res.status(500).json({ message: 'Server error retrieving inventory movements' });
  }
};

module.exports = {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  updateInventory,
  getLowStockItems,
  getInventoryMovements
};

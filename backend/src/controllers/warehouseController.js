const { validationResult } = require('express-validator');
const Warehouse = require('../models/Warehouse');
const Inventory = require('../models/Inventory');
const User = require('../models/User');

// Get all warehouses
const getAllWarehouses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const { search, isActive } = req.query;
    
    // Build filter
    let filter = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    const warehouses = await Warehouse.find(filter)
      .populate('manager', 'firstName lastName email phone')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    // Get inventory stats for each warehouse
    const warehousesWithStats = await Promise.all(
      warehouses.map(async (warehouse) => {
        const inventoryStats = await Inventory.aggregate([
          { $match: { warehouseId: warehouse._id } },
          {
            $group: {
              _id: null,
              totalProducts: { $sum: 1 },
              totalQuantity: { $sum: '$quantity' },
              totalValue: { $sum: { $multiply: ['$quantity', '$costPerUnit'] } },
              lowStockItems: {
                $sum: {
                  $cond: [
                    { $lte: ['$availableQuantity', 20] },
                    1,
                    0
                  ]
                }
              }
            }
          }
        ]);
        
        const stats = inventoryStats[0] || {
          totalProducts: 0,
          totalQuantity: 0,
          totalValue: 0,
          lowStockItems: 0
        };
        
        return {
          ...warehouse.toObject(),
          stats,
          occupancyPercentage: warehouse.occupancyPercentage
        };
      })
    );
    
    const total = await Warehouse.countDocuments(filter);
    
    res.json({
      message: 'Warehouses retrieved successfully',
      warehouses: warehousesWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get warehouses error:', error);
    res.status(500).json({ message: 'Server error retrieving warehouses' });
  }
};

// Get single warehouse
const getWarehouse = async (req, res) => {
  try {
    const { id } = req.params;
    
    const warehouse = await Warehouse.findById(id)
      .populate('manager', 'firstName lastName email phone');
    
    if (!warehouse) {
      return res.status(404).json({ message: 'Warehouse not found' });
    }
    
    // Get detailed inventory
    const inventory = await Inventory.find({ warehouseId: id })
      .populate('productId', 'name sku category')
      .sort({ createdAt: -1 });
    
    // Get warehouse stats
    const stats = await Inventory.aggregate([
      { $match: { warehouseId: warehouse._id } },
      {
        $group: {
          _id: '$productId.category',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          totalValue: { $sum: { $multiply: ['$quantity', '$costPerUnit'] } }
        }
      }
    ]);
    
    res.json({
      message: 'Warehouse retrieved successfully',
      warehouse: {
        ...warehouse.toObject(),
        inventory,
        categoryStats: stats,
        occupancyPercentage: warehouse.occupancyPercentage
      }
    });
  } catch (error) {
    console.error('Get warehouse error:', error);
    res.status(500).json({ message: 'Server error retrieving warehouse' });
  }
};

// Create new warehouse
const createWarehouse = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const warehouseData = req.body;
    
    // Check if warehouse code already exists
    const existingWarehouse = await Warehouse.findOne({ code: warehouseData.code });
    if (existingWarehouse) {
      return res.status(400).json({ message: 'Warehouse with this code already exists' });
    }
    
    // Verify manager exists and is active
    const manager = await User.findById(warehouseData.manager);
    if (!manager || !manager.isActive) {
      return res.status(400).json({ message: 'Invalid or inactive manager' });
    }
    
    // Create warehouse
    const warehouse = new Warehouse(warehouseData);
    await warehouse.save();
    
    const populatedWarehouse = await Warehouse.findById(warehouse._id)
      .populate('manager', 'firstName lastName email phone');
    
    res.status(201).json({
      message: 'Warehouse created successfully',
      warehouse: populatedWarehouse
    });
  } catch (error) {
    console.error('Create warehouse error:', error);
    res.status(500).json({ message: 'Server error creating warehouse' });
  }
};

// Update warehouse
const updateWarehouse = async (req, res) => {
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
    
    // Check if code is being updated and if it already exists
    if (updateData.code) {
      const existingWarehouse = await Warehouse.findOne({ 
        code: updateData.code,
        _id: { $ne: id }
      });
      if (existingWarehouse) {
        return res.status(400).json({ message: 'Warehouse with this code already exists' });
      }
    }
    
    // Verify manager if being updated
    if (updateData.manager) {
      const manager = await User.findById(updateData.manager);
      if (!manager || !manager.isActive) {
        return res.status(400).json({ message: 'Invalid or inactive manager' });
      }
    }
    
    const warehouse = await Warehouse.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('manager', 'firstName lastName email phone');
    
    if (!warehouse) {
      return res.status(404).json({ message: 'Warehouse not found' });
    }
    
    res.json({
      message: 'Warehouse updated successfully',
      warehouse
    });
  } catch (error) {
    console.error('Update warehouse error:', error);
    res.status(500).json({ message: 'Server error updating warehouse' });
  }
};

// Delete warehouse (soft delete)
const deleteWarehouse = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if warehouse has inventory
    const inventoryCount = await Inventory.countDocuments({ warehouseId: id });
    if (inventoryCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete warehouse with existing inventory. Please transfer or remove inventory first.' 
      });
    }
    
    const warehouse = await Warehouse.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    
    if (!warehouse) {
      return res.status(404).json({ message: 'Warehouse not found' });
    }
    
    res.json({
      message: 'Warehouse deleted successfully',
      warehouse
    });
  } catch (error) {
    console.error('Delete warehouse error:', error);
    res.status(500).json({ message: 'Server error deleting warehouse' });
  }
};

// Stock in to warehouse
const stockIn = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { warehouseId, productId, quantity, batchNumber, expiryDate, location } = req.body;
    
    // Find or create inventory record
    let inventory = await Inventory.findOne({
      productId,
      warehouseId,
      storeId: null
    });
    
    if (!inventory) {
      inventory = new Inventory({
        productId,
        warehouseId,
        quantity: 0,
        costPerUnit: 0,
        location
      });
    }
    
    // Update quantity and location
    inventory.quantity += quantity;
    if (batchNumber) inventory.batchNumber = batchNumber;
    if (expiryDate) inventory.expiryDate = new Date(expiryDate);
    if (location) inventory.location = location;
    
    await inventory.save();
    
    const populatedInventory = await Inventory.findById(inventory._id)
      .populate('productId', 'name sku')
      .populate('warehouseId', 'name code');
    
    res.json({
      message: 'Stock added successfully',
      inventory: populatedInventory
    });
  } catch (error) {
    console.error('Stock in error:', error);
    res.status(500).json({ message: 'Server error adding stock' });
  }
};

// Stock out from warehouse
const stockOut = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { warehouseId, productId, quantity, reason } = req.body;
    
    const inventory = await Inventory.findOne({
      productId,
      warehouseId,
      storeId: null
    });
    
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory record not found' });
    }
    
    if (inventory.quantity < quantity) {
      return res.status(400).json({ 
        message: 'Insufficient stock. Available: ' + inventory.quantity 
      });
    }
    
    inventory.quantity -= quantity;
    await inventory.save();
    
    const populatedInventory = await Inventory.findById(inventory._id)
      .populate('productId', 'name sku')
      .populate('warehouseId', 'name code');
    
    res.json({
      message: 'Stock removed successfully',
      inventory: populatedInventory
    });
  } catch (error) {
    console.error('Stock out error:', error);
    res.status(500).json({ message: 'Server error removing stock' });
  }
};

// Transfer stock between warehouses
const transferStock = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { fromWarehouseId, toWarehouseId, productId, quantity } = req.body;
    
    // Check source inventory
    const sourceInventory = await Inventory.findOne({
      productId,
      warehouseId: fromWarehouseId,
      storeId: null
    });
    
    if (!sourceInventory) {
      return res.status(404).json({ message: 'Source inventory not found' });
    }
    
    if (sourceInventory.quantity < quantity) {
      return res.status(400).json({ 
        message: 'Insufficient stock in source warehouse' 
      });
    }
    
    // Find or create destination inventory
    let destInventory = await Inventory.findOne({
      productId,
      warehouseId: toWarehouseId,
      storeId: null
    });
    
    if (!destInventory) {
      destInventory = new Inventory({
        productId,
        warehouseId: toWarehouseId,
        quantity: 0,
        costPerUnit: sourceInventory.costPerUnit
      });
    }
    
    // Update quantities
    sourceInventory.quantity -= quantity;
    destInventory.quantity += quantity;
    
    await sourceInventory.save();
    await destInventory.save();
    
    res.json({
      message: 'Stock transferred successfully',
      transfer: {
        from: fromWarehouseId,
        to: toWarehouseId,
        product: productId,
        quantity
      }
    });
  } catch (error) {
    console.error('Transfer stock error:', error);
    res.status(500).json({ message: 'Server error transferring stock' });
  }
};

module.exports = {
  getAllWarehouses,
  getWarehouse,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  stockIn,
  stockOut,
  transferStock
};

const { validationResult } = require('express-validator');
const Store = require('../models/Store');
const Inventory = require('../models/Inventory');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// Get all stores
const getAllStores = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const { search, isActive, type } = req.query;
    
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
    
    if (type) {
      filter.type = type;
    }
    
    const stores = await Store.find(filter)
      .populate('manager', 'firstName lastName email phone')
      .populate('warehouseId', 'name code')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    // Get stats for each store
    const storesWithStats = await Promise.all(
      stores.map(async (store) => {
        const inventoryStats = await Inventory.aggregate([
          { $match: { storeId: store._id } },
          {
            $group: {
              _id: null,
              totalProducts: { $sum: 1 },
              totalQuantity: { $sum: '$quantity' },
              totalValue: { $sum: { $multiply: ['$quantity', '$costPerUnit'] } },
              lowStockItems: {
                $sum: {
                  $cond: [
                    { $lte: ['$availableQuantity', store.settings.lowStockAlertThreshold || 20] },
                    1,
                    0
                  ]
                }
              }
            }
          }
        ]);
        
        const transactionStats = await Transaction.aggregate([
          { $match: { toLocationId: store._id, type: 'SALE' } },
          {
            $group: {
              _id: null,
              totalSales: { $sum: '$finalAmount' },
              totalTransactions: { $sum: 1 },
              avgTransactionValue: { $avg: '$finalAmount' }
            }
          }
        ]);
        
        const inventory = inventoryStats[0] || {
          totalProducts: 0,
          totalQuantity: 0,
          totalValue: 0,
          lowStockItems: 0
        };
        
        const transactions = transactionStats[0] || {
          totalSales: 0,
          totalTransactions: 0,
          avgTransactionValue: 0
        };
        
        return {
          ...store.toObject(),
          stats: {
            ...inventory,
            ...transactions
          }
        };
      })
    );
    
    const total = await Store.countDocuments(filter);
    
    res.json({
      message: 'Stores retrieved successfully',
      stores: storesWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get stores error:', error);
    res.status(500).json({ message: 'Server error retrieving stores' });
  }
};

// Get single store
const getStore = async (req, res) => {
  try {
    const { id } = req.params;
    
    const store = await Store.findById(id)
      .populate('manager', 'firstName lastName email phone')
      .populate('warehouseId', 'name code address');
    
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }
    
    // Get detailed inventory
    const inventory = await Inventory.find({ storeId: id })
      .populate('productId', 'name sku category')
      .sort({ createdAt: -1 });
    
    // Get recent transactions
    const recentTransactions = await Transaction.find({ 
      toLocationId: id, 
      type: 'SALE' 
    })
      .populate('createdBy', 'firstName lastName')
      .sort({ transactionDate: -1 })
      .limit(10);
    
    // Get daily sales for the last 30 days
    const dailySales = await Transaction.aggregate([
      { 
        $match: { 
          toLocationId: store._id, 
          type: 'SALE',
          transactionDate: { 
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) 
          }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$transactionDate' } },
          totalSales: { $sum: '$finalAmount' },
          transactionCount: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);
    
    // Get top selling products
    const topProducts = await Transaction.aggregate([
      { $match: { toLocationId: store._id, type: 'SALE' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.totalPrice' }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' }
    ]);
    
    res.json({
      message: 'Store retrieved successfully',
      store: {
        ...store.toObject(),
        inventory,
        recentTransactions,
        dailySales,
        topProducts
      }
    });
  } catch (error) {
    console.error('Get store error:', error);
    res.status(500).json({ message: 'Server error retrieving store' });
  }
};

// Create new store
const createStore = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const storeData = req.body;
    
    // Check if store code already exists
    const existingStore = await Store.findOne({ code: storeData.code });
    if (existingStore) {
      return res.status(400).json({ message: 'Store with this code already exists' });
    }
    
    // Verify manager exists and is active
    const manager = await User.findById(storeData.manager);
    if (!manager || !manager.isActive) {
      return res.status(400).json({ message: 'Invalid or inactive manager' });
    }
    
    // Verify warehouse exists
    const Warehouse = require('../models/Warehouse');
    const warehouse = await Warehouse.findById(storeData.warehouseId);
    if (!warehouse || !warehouse.isActive) {
      return res.status(400).json({ message: 'Invalid or inactive warehouse' });
    }
    
    // Create store
    const store = new Store(storeData);
    await store.save();
    
    const populatedStore = await Store.findById(store._id)
      .populate('manager', 'firstName lastName email phone')
      .populate('warehouseId', 'name code');
    
    res.status(201).json({
      message: 'Store created successfully',
      store: populatedStore
    });
  } catch (error) {
    console.error('Create store error:', error);
    res.status(500).json({ message: 'Server error creating store' });
  }
};

// Update store
const updateStore = async (req, res) => {
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
      const existingStore = await Store.findOne({ 
        code: updateData.code,
        _id: { $ne: id }
      });
      if (existingStore) {
        return res.status(400).json({ message: 'Store with this code already exists' });
      }
    }
    
    // Verify manager if being updated
    if (updateData.manager) {
      const manager = await User.findById(updateData.manager);
      if (!manager || !manager.isActive) {
        return res.status(400).json({ message: 'Invalid or inactive manager' });
      }
    }
    
    // Verify warehouse if being updated
    if (updateData.warehouseId) {
      const Warehouse = require('../models/Warehouse');
      const warehouse = await Warehouse.findById(updateData.warehouseId);
      if (!warehouse || !warehouse.isActive) {
        return res.status(400).json({ message: 'Invalid or inactive warehouse' });
      }
    }
    
    const store = await Store.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('manager', 'firstName lastName email phone')
     .populate('warehouseId', 'name code');
    
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }
    
    res.json({
      message: 'Store updated successfully',
      store
    });
  } catch (error) {
    console.error('Update store error:', error);
    res.status(500).json({ message: 'Server error updating store' });
  }
};

// Delete store (soft delete)
const deleteStore = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if store has inventory
    const inventoryCount = await Inventory.countDocuments({ storeId: id });
    if (inventoryCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete store with existing inventory. Please transfer or remove inventory first.' 
      });
    }
    
    const store = await Store.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }
    
    res.json({
      message: 'Store deleted successfully',
      store
    });
  } catch (error) {
    console.error('Delete store error:', error);
    res.status(500).json({ message: 'Server error deleting store' });
  }
};

// Transfer stock from warehouse to store
const transferToStore = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { warehouseId, storeId, productId, quantity } = req.body;
    
    // Check source inventory
    const sourceInventory = await Inventory.findOne({
      productId,
      warehouseId,
      storeId: null
    });
    
    if (!sourceInventory) {
      return res.status(404).json({ message: 'Source inventory not found' });
    }
    
    if (sourceInventory.quantity < quantity) {
      return res.status(400).json({ 
        message: 'Insufficient stock in warehouse' 
      });
    }
    
    // Find or create destination inventory
    let destInventory = await Inventory.findOne({
      productId,
      storeId,
      warehouseId: null
    });
    
    if (!destInventory) {
      destInventory = new Inventory({
        productId,
        storeId,
        quantity: 0,
        costPerUnit: sourceInventory.costPerUnit
      });
    }
    
    // Update quantities
    sourceInventory.quantity -= quantity;
    destInventory.quantity += quantity;
    
    await sourceInventory.save();
    await destInventory.save();
    
    // Create transfer transaction
    const Transaction = require('../models/Transaction');
    const transfer = new Transaction({
      type: 'TRANSFER',
      fromLocation: 'WAREHOUSE',
      toLocation: 'STORE',
      fromLocationId: warehouseId,
      toLocationId: storeId,
      items: [{
        productId,
        quantity,
        unitPrice: sourceInventory.costPerUnit,
        totalPrice: quantity * sourceInventory.costPerUnit
      }],
      totalAmount: quantity * sourceInventory.costPerUnit,
      finalAmount: quantity * sourceInventory.costPerUnit,
      createdBy: req.user._id
    });
    
    await transfer.save();
    
    res.json({
      message: 'Stock transferred to store successfully',
      transfer: {
        from: warehouseId,
        to: storeId,
        product: productId,
        quantity,
        transactionId: transfer._id
      }
    });
  } catch (error) {
    console.error('Transfer to store error:', error);
    res.status(500).json({ message: 'Server error transferring stock to store' });
  }
};

// Get store performance analytics
const getStoreAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;
    
    // Build date filter
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.transactionDate = {};
      if (startDate) dateFilter.transactionDate.$gte = new Date(startDate);
      if (endDate) dateFilter.transactionDate.$lte = new Date(endDate);
    }
    
    // Get sales performance
    const salesPerformance = await Transaction.aggregate([
      { 
        $match: { 
          toLocationId: new ObjectId(id), 
          type: 'SALE',
          ...dateFilter
        } 
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$finalAmount' },
          totalTransactions: { $sum: 1 },
          avgTransactionValue: { $avg: '$finalAmount' },
          totalItemsSold: { $sum: { $sum: '$items.quantity' } }
        }
      }
    ]);
    
    // Get hourly sales pattern
    const hourlySales = await Transaction.aggregate([
      { 
        $match: { 
          toLocationId: new ObjectId(id), 
          type: 'SALE',
          ...dateFilter
        } 
      },
      {
        $group: {
          _id: { $hour: '$transactionDate' },
          revenue: { $sum: '$finalAmount' },
          transactions: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);
    
    // Get category performance
    const categoryPerformance = await Transaction.aggregate([
      { 
        $match: { 
          toLocationId: new ObjectId(id), 
          type: 'SALE',
          ...dateFilter
        } 
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product.category',
          revenue: { $sum: '$items.totalPrice' },
          quantity: { $sum: '$items.quantity' }
        }
      },
      { $sort: { revenue: -1 } }
    ]);
    
    const performance = salesPerformance[0] || {
      totalRevenue: 0,
      totalTransactions: 0,
      avgTransactionValue: 0,
      totalItemsSold: 0
    };
    
    res.json({
      message: 'Store analytics retrieved successfully',
      analytics: {
        performance,
        hourlySales,
        categoryPerformance
      }
    });
  } catch (error) {
    console.error('Get store analytics error:', error);
    res.status(500).json({ message: 'Server error retrieving store analytics' });
  }
};

module.exports = {
  getAllStores,
  getStore,
  createStore,
  updateStore,
  deleteStore,
  transferToStore,
  getStoreAnalytics
};

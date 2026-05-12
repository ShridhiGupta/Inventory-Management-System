const { validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');
const Inventory = require('../models/Inventory');
const Product = require('../models/Product');

// Get all transactions
const getAllTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const { type, status, startDate, endDate, search } = req.query;
    
    // Build filter
    let filter = {};
    
    if (type) {
      filter.type = type;
    }
    
    if (status) {
      filter.status = status;
    }
    
    if (startDate || endDate) {
      filter.transactionDate = {};
      if (startDate) filter.transactionDate.$gte = new Date(startDate);
      if (endDate) filter.transactionDate.$lte = new Date(endDate);
    }
    
    if (search) {
      filter.$or = [
        { transactionNumber: { $regex: search, $options: 'i' } },
        { referenceNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    const transactions = await Transaction.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .populate('fromLocationId', 'name code')
      .populate('toLocationId', 'name code')
      .populate('items.productId', 'name sku')
      .skip(skip)
      .limit(limit)
      .sort({ transactionDate: -1 });
    
    const total = await Transaction.countDocuments(filter);
    
    res.json({
      message: 'Transactions retrieved successfully',
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Server error retrieving transactions' });
  }
};

// Get single transaction
const getTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    
    const transaction = await Transaction.findById(id)
      .populate('createdBy', 'firstName lastName email phone')
      .populate('fromLocationId', 'name code address')
      .populate('toLocationId', 'name code address')
      .populate('items.productId', 'name sku category brand');
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json({
      message: 'Transaction retrieved successfully',
      transaction
    });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ message: 'Server error retrieving transaction' });
  }
};

// Create sale transaction
const createSale = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { storeId, items, paymentMethod, customerInfo } = req.body;
    
    // Validate items and check inventory
    const validatedItems = [];
    let totalAmount = 0;
    
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isActive) {
        return res.status(400).json({ message: `Product ${item.productId} not found or inactive` });
      }
      
      // Check inventory
      const inventory = await Inventory.findOne({
        productId: item.productId,
        storeId: storeId,
        warehouseId: null
      });
      
      if (!inventory || inventory.availableQuantity < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for product ${product.name}. Available: ${inventory?.availableQuantity || 0}` 
        });
      }
      
      const unitPrice = product.sellingPrice;
      const totalPrice = unitPrice * item.quantity;
      
      validatedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
        batchNumber: inventory.batchNumber
      });
      
      totalAmount += totalPrice;
    }
    
    // Calculate tax and final amount
    const Store = require('../models/Store');
    const store = await Store.findById(storeId);
    const taxAmount = totalAmount * (store.settings.taxRate / 100);
    const finalAmount = totalAmount + taxAmount;
    
    // Create transaction
    const transaction = new Transaction({
      type: 'SALE',
      fromLocation: 'STORE',
      toLocation: 'CUSTOMER',
      fromLocationId: storeId,
      toLocationId: null, // Customer
      items: validatedItems,
      totalAmount,
      taxAmount,
      finalAmount,
      paymentMethod,
      paymentStatus: 'PAID',
      createdBy: req.user._id,
      notes: customerInfo ? `Customer: ${customerInfo.name}` : ''
    });
    
    await transaction.save();
    
    // Update inventory
    for (const item of validatedItems) {
      await Inventory.findOneAndUpdate(
        { productId: item.productId, storeId: storeId, warehouseId: null },
        { 
          $inc: { 
            quantity: -item.quantity,
            availableQuantity: -item.quantity
          }
        }
      );
    }
    
    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('createdBy', 'firstName lastName email')
      .populate('fromLocationId', 'name code')
      .populate('items.productId', 'name sku');
    
    res.status(201).json({
      message: 'Sale created successfully',
      transaction: populatedTransaction
    });
  } catch (error) {
    console.error('Create sale error:', error);
    res.status(500).json({ message: 'Server error creating sale' });
  }
};

// Create purchase transaction
const createPurchase = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { warehouseId, vendorId, items, paymentTerms } = req.body;
    
    // Validate items
    const validatedItems = [];
    let totalAmount = 0;
    
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({ message: `Product ${item.productId} not found` });
      }
      
      const unitPrice = item.unitPrice || product.costPrice;
      const totalPrice = unitPrice * item.quantity;
      
      validatedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
        batchNumber: item.batchNumber
      });
      
      totalAmount += totalPrice;
    }
    
    // Create transaction
    const transaction = new Transaction({
      type: 'PURCHASE',
      fromLocation: 'VENDOR',
      toLocation: 'WAREHOUSE',
      fromLocationId: vendorId,
      toLocationId: warehouseId,
      items: validatedItems,
      totalAmount,
      finalAmount: totalAmount,
      paymentStatus: 'PENDING',
      createdBy: req.user._id,
      notes: `Payment Terms: ${paymentTerms}`
    });
    
    await transaction.save();
    
    // Update inventory
    for (const item of validatedItems) {
      const inventory = await Inventory.findOne({
        productId: item.productId,
        warehouseId: warehouseId,
        storeId: null
      });
      
      if (inventory) {
        await Inventory.findByIdAndUpdate(inventory._id, {
          $inc: { 
            quantity: item.quantity,
            availableQuantity: item.quantity
          }
        });
      } else {
        const newInventory = new Inventory({
          productId: item.productId,
          warehouseId: warehouseId,
          quantity: item.quantity,
          availableQuantity: item.quantity,
          costPerUnit: item.unitPrice,
          batchNumber: item.batchNumber
        });
        await newInventory.save();
      }
    }
    
    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('createdBy', 'firstName lastName email')
      .populate('fromLocationId', 'name')
      .populate('toLocationId', 'name code')
      .populate('items.productId', 'name sku');
    
    res.status(201).json({
      message: 'Purchase created successfully',
      transaction: populatedTransaction
    });
  } catch (error) {
    console.error('Create purchase error:', error);
    res.status(500).json({ message: 'Server error creating purchase' });
  }
};

// Create return transaction
const createReturn = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { originalTransactionId, items, reason } = req.body;
    
    // Get original transaction
    const originalTransaction = await Transaction.findById(originalTransactionId);
    if (!originalTransaction) {
      return res.status(404).json({ message: 'Original transaction not found' });
    }
    
    // Validate return items
    const validatedItems = [];
    let totalAmount = 0;
    
    for (const item of items) {
      const originalItem = originalTransaction.items.find(
        i => i.productId.toString() === item.productId
      );
      
      if (!originalItem) {
        return res.status(400).json({ message: `Item not found in original transaction` });
      }
      
      if (item.quantity > originalItem.quantity) {
        return res.status(400).json({ message: `Return quantity exceeds original quantity` });
      }
      
      const unitPrice = originalItem.unitPrice;
      const totalPrice = unitPrice * item.quantity;
      
      validatedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        totalPrice
      });
      
      totalAmount += totalPrice;
    }
    
    // Create return transaction
    const transaction = new Transaction({
      type: 'RETURN',
      fromLocation: originalTransaction.toLocation,
      toLocation: originalTransaction.fromLocation,
      fromLocationId: originalTransaction.toLocationId,
      toLocationId: originalTransaction.fromLocationId,
      items: validatedItems,
      totalAmount,
      finalAmount: totalAmount,
      paymentStatus: 'PENDING',
      createdBy: req.user._id,
      notes: `Return from transaction ${originalTransaction.transactionNumber}. Reason: ${reason}`
    });
    
    await transaction.save();
    
    // Update inventory (add items back)
    if (originalTransaction.type === 'SALE') {
      // Return to store
      for (const item of validatedItems) {
        await Inventory.findOneAndUpdate(
          { 
            productId: item.productId, 
            storeId: originalTransaction.fromLocationId, 
            warehouseId: null 
          },
          { 
            $inc: { 
              quantity: item.quantity,
              availableQuantity: item.quantity
            }
          },
          { upsert: true }
        );
      }
    }
    
    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('createdBy', 'firstName lastName email')
      .populate('fromLocationId', 'name code')
      .populate('toLocationId', 'name code')
      .populate('items.productId', 'name sku');
    
    res.status(201).json({
      message: 'Return created successfully',
      transaction: populatedTransaction
    });
  } catch (error) {
    console.error('Create return error:', error);
    res.status(500).json({ message: 'Server error creating return' });
  }
};

// Update transaction status
const updateTransactionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;
    
    const updateData = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    
    const transaction = await Transaction.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName email')
     .populate('items.productId', 'name sku');
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json({
      message: 'Transaction status updated successfully',
      transaction
    });
  } catch (error) {
    console.error('Update transaction status error:', error);
    res.status(500).json({ message: 'Server error updating transaction status' });
  }
};

// Get transaction analytics
const getTransactionAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, type, locationId } = req.query;
    
    // Build filter
    let filter = {};
    if (startDate || endDate) {
      filter.transactionDate = {};
      if (startDate) filter.transactionDate.$gte = new Date(startDate);
      if (endDate) filter.transactionDate.$lte = new Date(endDate);
    }
    
    if (type) {
      filter.type = type;
    }
    
    if (locationId) {
      filter.$or = [
        { fromLocationId: locationId },
        { toLocationId: locationId }
      ];
    }
    
    // Get overall stats
    const stats = await Transaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$finalAmount' },
          totalTransactions: { $sum: 1 },
          avgTransactionValue: { $avg: '$finalAmount' },
          totalTax: { $sum: '$taxAmount' }
        }
      }
    ]);
    
    // Get daily trends
    const dailyTrends = await Transaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$transactionDate' } },
          revenue: { $sum: '$finalAmount' },
          transactions: { $sum: 1 },
          tax: { $sum: '$taxAmount' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);
    
    // Get type breakdown
    const typeBreakdown = await Transaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$type',
          revenue: { $sum: '$finalAmount' },
          transactions: { $sum: 1 },
          avgValue: { $avg: '$finalAmount' }
        }
      }
    ]);
    
    // Get payment method breakdown (for sales)
    const paymentBreakdown = await Transaction.aggregate([
      { $match: { ...filter, type: 'SALE' } },
      {
        $group: {
          _id: '$paymentMethod',
          revenue: { $sum: '$finalAmount' },
          transactions: { $sum: 1 }
        }
      }
    ]);
    
    const overallStats = stats[0] || {
      totalRevenue: 0,
      totalTransactions: 0,
      avgTransactionValue: 0,
      totalTax: 0
    };
    
    res.json({
      message: 'Transaction analytics retrieved successfully',
      analytics: {
        stats: overallStats,
        dailyTrends,
        typeBreakdown,
        paymentBreakdown
      }
    });
  } catch (error) {
    console.error('Get transaction analytics error:', error);
    res.status(500).json({ message: 'Server error retrieving transaction analytics' });
  }
};

module.exports = {
  getAllTransactions,
  getTransaction,
  createSale,
  createPurchase,
  createReturn,
  updateTransactionStatus,
  getTransactionAnalytics
};

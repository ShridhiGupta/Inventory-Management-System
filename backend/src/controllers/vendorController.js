const { validationResult } = require('express-validator');
const Vendor = require('../models/Vendor');
const Product = require('../models/Product');
const Transaction = require('../models/Transaction');

// Get all vendors
const getAllVendors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const { search, isActive, rating } = req.query;
    
    // Build filter
    let filter = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    if (rating) {
      filter.rating = { $gte: parseFloat(rating) };
    }
    
    const vendors = await Vendor.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    // Get stats for each vendor
    const vendorsWithStats = await Promise.all(
      vendors.map(async (vendor) => {
        const productCount = await Product.countDocuments({ vendorId: vendor._id, isActive: true });
        
        const transactionStats = await Transaction.aggregate([
          { $match: { type: 'PURCHASE', 'items.0': { $exists: true } } },
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
          { $match: { 'product.vendorId': vendor._id } },
          {
            $group: {
              _id: null,
              totalTransactions: { $sum: 1 },
              totalAmount: { $sum: '$finalAmount' },
              avgTransactionValue: { $avg: '$finalAmount' }
            }
          }
        ]);
        
        const stats = transactionStats[0] || {
          totalTransactions: 0,
          totalAmount: 0,
          avgTransactionValue: 0
        };
        
        return {
          ...vendor.toObject(),
          stats: {
            productCount,
            ...stats
          }
        };
      })
    );
    
    const total = await Vendor.countDocuments(filter);
    
    res.json({
      message: 'Vendors retrieved successfully',
      vendors: vendorsWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get vendors error:', error);
    res.status(500).json({ message: 'Server error retrieving vendors' });
  }
};

// Get single vendor
const getVendor = async (req, res) => {
  try {
    const { id } = req.params;
    
    const vendor = await Vendor.findById(id);
    
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    
    // Get vendor's products
    const products = await Product.find({ vendorId: id, isActive: true })
      .sort({ createdAt: -1 });
    
    // Get vendor's transactions
    const transactions = await Transaction.aggregate([
      { $match: { type: 'PURCHASE' } },
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
      { $match: { 'product.vendorId': vendor._id } },
      {
        $group: {
          _id: '$_id',
          transactionNumber: { $first: '$transactionNumber' },
          transactionDate: { $first: '$transactionDate' },
          totalAmount: { $first: '$totalAmount' },
          status: { $first: '$status' },
          paymentStatus: { $first: '$paymentStatus' },
          itemCount: { $sum: 1 }
        }
      },
      { $sort: { transactionDate: -1 } },
      { $limit: 10 }
    ]);
    
    // Get monthly performance
    const monthlyPerformance = await Transaction.aggregate([
      { $match: { type: 'PURCHASE' } },
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
      { $match: { 'product.vendorId': vendor._id } },
      {
        $group: {
          _id: {
            year: { $year: '$transactionDate' },
            month: { $month: '$transactionDate' }
          },
          totalAmount: { $sum: '$finalAmount' },
          transactionCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);
    
    res.json({
      message: 'Vendor retrieved successfully',
      vendor: {
        ...vendor.toObject(),
        products,
        transactions,
        monthlyPerformance
      }
    });
  } catch (error) {
    console.error('Get vendor error:', error);
    res.status(500).json({ message: 'Server error retrieving vendor' });
  }
};

// Create new vendor
const createVendor = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const vendorData = req.body;
    
    // Check if email already exists
    if (vendorData.email) {
      const existingVendor = await Vendor.findOne({ email: vendorData.email });
      if (existingVendor) {
        return res.status(400).json({ message: 'Vendor with this email already exists' });
      }
    }
    
    // Create vendor
    const vendor = new Vendor(vendorData);
    await vendor.save();
    
    res.status(201).json({
      message: 'Vendor created successfully',
      vendor
    });
  } catch (error) {
    console.error('Create vendor error:', error);
    res.status(500).json({ message: 'Server error creating vendor' });
  }
};

// Update vendor
const updateVendor = async (req, res) => {
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
    
    // Check if email is being updated and if it already exists
    if (updateData.email) {
      const existingVendor = await Vendor.findOne({ 
        email: updateData.email,
        _id: { $ne: id }
      });
      if (existingVendor) {
        return res.status(400).json({ message: 'Vendor with this email already exists' });
      }
    }
    
    const vendor = await Vendor.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    
    res.json({
      message: 'Vendor updated successfully',
      vendor
    });
  } catch (error) {
    console.error('Update vendor error:', error);
    res.status(500).json({ message: 'Server error updating vendor' });
  }
};

// Delete vendor (soft delete)
const deleteVendor = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if vendor has active products
    const productCount = await Product.countDocuments({ vendorId: id, isActive: true });
    if (productCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete vendor with active products. Please deactivate products first.' 
      });
    }
    
    const vendor = await Vendor.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    
    res.json({
      message: 'Vendor deleted successfully',
      vendor
    });
  } catch (error) {
    console.error('Delete vendor error:', error);
    res.status(500).json({ message: 'Server error deleting vendor' });
  }
};

// Update vendor rating
const updateVendorRating = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { id } = req.params;
    const { rating } = req.body;
    
    if (rating < 0 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 0 and 5' });
    }
    
    const vendor = await Vendor.findByIdAndUpdate(
      id,
      { rating },
      { new: true, runValidators: true }
    );
    
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    
    res.json({
      message: 'Vendor rating updated successfully',
      vendor
    });
  } catch (error) {
    console.error('Update vendor rating error:', error);
    res.status(500).json({ message: 'Server error updating vendor rating' });
  }
};

// Get vendor performance analytics
const getVendorAnalytics = async (req, res) => {
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
    
    // Get performance metrics
    const performance = await Transaction.aggregate([
      { $match: { type: 'PURCHASE', ...dateFilter } },
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
      { $match: { 'product.vendorId': new ObjectId(id) } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$finalAmount' },
          totalTransactions: { $sum: 1 },
          avgTransactionValue: { $avg: '$finalAmount' },
          totalItemsSold: { $sum: '$items.quantity' }
        }
      }
    ]);
    
    // Get top products
    const topProducts = await Transaction.aggregate([
      { $match: { type: 'PURCHASE', ...dateFilter } },
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
      { $match: { 'product.vendorId': new ObjectId(id) } },
      {
        $group: {
          _id: '$items.productId',
          productName: { $first: '$product.name' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.totalPrice' }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 }
    ]);
    
    // Get monthly trends
    const monthlyTrends = await Transaction.aggregate([
      { $match: { type: 'PURCHASE', ...dateFilter } },
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
      { $match: { 'product.vendorId': new ObjectId(id) } },
      {
        $group: {
          _id: {
            year: { $year: '$transactionDate' },
            month: { $month: '$transactionDate' }
          },
          revenue: { $sum: '$finalAmount' },
          transactions: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    const stats = performance[0] || {
      totalRevenue: 0,
      totalTransactions: 0,
      avgTransactionValue: 0,
      totalItemsSold: 0
    };
    
    res.json({
      message: 'Vendor analytics retrieved successfully',
      analytics: {
        stats,
        topProducts,
        monthlyTrends
      }
    });
  } catch (error) {
    console.error('Get vendor analytics error:', error);
    res.status(500).json({ message: 'Server error retrieving vendor analytics' });
  }
};

module.exports = {
  getAllVendors,
  getVendor,
  createVendor,
  updateVendor,
  deleteVendor,
  updateVendorRating,
  getVendorAnalytics
};

const { validationResult } = require('express-validator');
const Promotion = require('../models/Promotion');

// Get all promotions
const getAllPromotions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const { search, type, isActive, storeId } = req.query;
    
    // Build filter
    let filter = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (type) {
      filter.type = type;
    }
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    if (storeId) {
      filter.applicableStores = storeId;
    }
    
    const promotions = await Promotion.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .populate('applicableProducts', 'name sku')
      .populate('applicableStores', 'name code')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    const total = await Promotion.countDocuments(filter);
    
    res.json({
      message: 'Promotions retrieved successfully',
      promotions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get promotions error:', error);
    res.status(500).json({ message: 'Server error retrieving promotions' });
  }
};

// Get single promotion
const getPromotion = async (req, res) => {
  try {
    const { id } = req.params;
    
    const promotion = await Promotion.findById(id)
      .populate('createdBy', 'firstName lastName email')
      .populate('applicableProducts', 'name sku category')
      .populate('applicableStores', 'name code address');
    
    if (!promotion) {
      return res.status(404).json({ message: 'Promotion not found' });
    }
    
    res.json({
      message: 'Promotion retrieved successfully',
      promotion
    });
  } catch (error) {
    console.error('Get promotion error:', error);
    res.status(500).json({ message: 'Server error retrieving promotion' });
  }
};

// Create new promotion
const createPromotion = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const promotionData = req.body;
    promotionData.createdBy = req.user._id;
    
    // Check if promotion code already exists
    const existingPromotion = await Promotion.findOne({ code: promotionData.code });
    if (existingPromotion) {
      return res.status(400).json({ message: 'Promotion with this code already exists' });
    }
    
    // Create promotion
    const promotion = new Promotion(promotionData);
    await promotion.save();
    
    const populatedPromotion = await Promotion.findById(promotion._id)
      .populate('createdBy', 'firstName lastName email')
      .populate('applicableProducts', 'name sku')
      .populate('applicableStores', 'name code');
    
    res.status(201).json({
      message: 'Promotion created successfully',
      promotion: populatedPromotion
    });
  } catch (error) {
    console.error('Create promotion error:', error);
    res.status(500).json({ message: 'Server error creating promotion' });
  }
};

// Update promotion
const updatePromotion = async (req, res) => {
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
      const existingPromotion = await Promotion.findOne({ 
        code: updateData.code,
        _id: { $ne: id }
      });
      if (existingPromotion) {
        return res.status(400).json({ message: 'Promotion with this code already exists' });
      }
    }
    
    const promotion = await Promotion.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName email')
     .populate('applicableProducts', 'name sku')
     .populate('applicableStores', 'name code');
    
    if (!promotion) {
      return res.status(404).json({ message: 'Promotion not found' });
    }
    
    res.json({
      message: 'Promotion updated successfully',
      promotion
    });
  } catch (error) {
    console.error('Update promotion error:', error);
    res.status(500).json({ message: 'Server error updating promotion' });
  }
};

// Delete promotion (soft delete)
const deletePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    
    const promotion = await Promotion.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    
    if (!promotion) {
      return res.status(404).json({ message: 'Promotion not found' });
    }
    
    res.json({
      message: 'Promotion deleted successfully',
      promotion
    });
  } catch (error) {
    console.error('Delete promotion error:', error);
    res.status(500).json({ message: 'Server error deleting promotion' });
  }
};

// Validate promotion code
const validatePromotionCode = async (req, res) => {
  try {
    const { code, userId, cartAmount, applicableProducts } = req.body;
    
    const promotion = await Promotion.validateCode(code);
    
    if (!promotion) {
      return res.status(400).json({ message: 'Invalid or expired promotion code' });
    }
    
    // Check usage limits
    if (promotion.usageLimit && promotion.usageCount >= promotion.usageLimit) {
      return res.status(400).json({ message: 'Promotion usage limit reached' });
    }
    
    // Check minimum amount
    if (promotion.minimumAmount && cartAmount < promotion.minimumAmount) {
      return res.status(400).json({ 
        message: `Minimum amount of $${promotion.minimumAmount} required` 
      });
    }
    
    // Calculate discount
    let discountAmount = 0;
    
    if (promotion.type === 'PERCENTAGE') {
      discountAmount = cartAmount * (promotion.value / 100);
      if (promotion.maximumDiscount) {
        discountAmount = Math.min(discountAmount, promotion.maximumDiscount);
      }
    } else if (promotion.type === 'FIXED_AMOUNT') {
      discountAmount = promotion.value;
    } else if (promotion.type === 'FREE_SHIPPING') {
      // Calculate shipping cost (would need shipping service integration)
      discountAmount = 10; // Fixed shipping cost for example
    }
    
    res.json({
      message: 'Promotion code validated successfully',
      promotion: {
        id: promotion._id,
        name: promotion.name,
        type: promotion.type,
        discountAmount,
        description: promotion.description
      }
    });
  } catch (error) {
    console.error('Validate promotion code error:', error);
    res.status(500).json({ message: 'Server error validating promotion code' });
  }
};

// Get active promotions
const getActivePromotions = async (req, res) => {
  try {
    const { storeId } = req.query;
    
    let filter = {
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    };
    
    if (storeId) {
      filter.$or = [
        { applicableStores: { $size: 0 } }, // Global promotions
        { applicableStores: storeId } // Store-specific promotions
      ];
    }
    
    const promotions = await Promotion.find(filter)
      .populate('applicableProducts', 'name sku')
      .populate('applicableStores', 'name code')
      .sort({ createdAt: -1 });
    
    res.json({
      message: 'Active promotions retrieved successfully',
      promotions
    });
  } catch (error) {
    console.error('Get active promotions error:', error);
    res.status(500).json({ message: 'Server error retrieving active promotions' });
  }
};

module.exports = {
  getAllPromotions,
  getPromotion,
  createPromotion,
  updatePromotion,
  deletePromotion,
  validatePromotionCode,
  getActivePromotions
};

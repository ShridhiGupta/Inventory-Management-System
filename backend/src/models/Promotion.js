const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Promotion name is required'],
    trim: true,
    maxlength: [100, 'Promotion name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  code: {
    type: String,
    required: [true, 'Promotion code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: [20, 'Promotion code cannot exceed 20 characters']
  },
  type: {
    type: String,
    required: [true, 'Promotion type is required'],
    enum: ['PERCENTAGE', 'FIXED_AMOUNT', 'BUY_X_GET_Y', 'FREE_SHIPPING', 'BOGO']
  },
  value: {
    type: Number,
    required: [true, 'Promotion value is required'],
    min: [0, 'Promotion value cannot be negative']
  },
  minimumAmount: {
    type: Number,
    default: 0,
    min: [0, 'Minimum amount cannot be negative']
  },
  maximumDiscount: {
    type: Number,
    min: [0, 'Maximum discount cannot be negative']
  },
  usageLimit: {
    type: Number,
    min: [1, 'Usage limit must be at least 1']
  },
  usageCount: {
    type: Number,
    default: 0,
    min: [0, 'Usage count cannot be negative']
  },
  userLimit: {
    type: Number,
    min: [1, 'User limit must be at least 1']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  applicableCategories: [{
    type: String,
    enum: ['ELECTRONICS', 'CLOTHING', 'FOOD', 'FURNITURE', 'BOOKS', 'TOYS', 'SPORTS', 'BEAUTY', 'AUTOMOTIVE', 'OTHER']
  }],
  applicableStores: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  conditions: {
    type: String,
    trim: true,
    maxlength: [1000, 'Conditions cannot exceed 1000 characters']
  }
}, {
  timestamps: true
});

// Indexes for faster queries
promotionSchema.index({ code: 1 });
promotionSchema.index({ type: 1 });
promotionSchema.index({ startDate: 1, endDate: 1 });
promotionSchema.index({ isActive: 1 });
promotionSchema.index({ createdBy: 1 });

// Virtual for checking if promotion is currently active
promotionSchema.virtual('isCurrentlyActive').get(function() {
  const now = new Date();
  return this.isActive && now >= this.startDate && now <= this.endDate;
});

// Virtual for remaining usage
promotionSchema.virtual('remainingUsage').get(function() {
  if (!this.usageLimit) return null;
  return Math.max(0, this.usageLimit - this.usageCount);
});

// Static method to find active promotions
promotionSchema.statics.findActive = function() {
  const now = new Date();
  return this.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now }
  });
};

// Static method to validate promotion code
promotionSchema.statics.validateCode = function(code, userId) {
  const now = new Date();
  return this.findOne({
    code: code.toUpperCase(),
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now }
  });
};

// Pre-save middleware to validate dates
promotionSchema.pre('save', function(next) {
  if (this.startDate >= this.endDate) {
    return next(new Error('End date must be after start date'));
  }
  next();
});

module.exports = mongoose.model('Promotion', promotionSchema);

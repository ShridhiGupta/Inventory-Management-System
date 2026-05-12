const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  manufacturer: {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    gstin: {
      type: String,
      trim: true,
      uppercase: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: {
        type: String,
        default: 'India'
      }
    },
    contact: {
      phone: String,
      email: String,
      website: String
    },
    pan: String,
    msme: String
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  logo: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  contractDetails: {
    contractNumber: String,
    startDate: Date,
    endDate: Date,
    terms: String,
    creditPeriod: {
      type: Number,
      default: 30
    },
    creditLimit: {
      type: Number,
      default: 0
    }
  },
  performance: {
    totalProducts: {
      type: Number,
      default: 0
    },
    avgMargin: {
      type: Number,
      default: 0
    },
    totalRevenue: {
      type: Number,
      default: 0
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 3
    },
    lastOrderDate: Date
  },
  aiInsights: {
    brandHealth: {
      score: {
        type: Number,
        min: 0,
        max: 100,
        default: 50
      },
      factors: [{
        factor: String,
        score: Number,
        impact: String
      }]
    },
    marketPosition: {
      marketShare: Number,
      competitorCount: Number,
      growthRate: Number
    },
    recommendations: [{
      type: {
        type: String,
        enum: ['pricing', 'marketing', 'inventory', 'assortment'],
        default: 'pricing'
      },
      priority: {
        type: String,
        enum: ['high', 'medium', 'low'],
        default: 'medium'
      },
      suggestion: String,
      expectedImpact: String
    }]
  }
}, {
  timestamps: true
});

brandSchema.index({ code: 1 });
brandSchema.index({ 'manufacturer.name': 1 });
brandSchema.index({ isActive: 1 });

module.exports = mongoose.model('Brand', brandSchema);

const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
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
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  level: {
    type: Number,
    default: 1
  },
  department: {
    type: String,
    trim: true,
    maxlength: 100
  },
  serviceDepartment: {
    type: String,
    trim: true,
    maxlength: 100
  },
  incomeHead: {
    type: String,
    trim: true,
    maxlength: 100
  },
  serviceGroup: {
    type: String,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  image: {
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
  taxSlab: {
    type: Number,
    default: 18
  },
  hsnRequired: {
    type: Boolean,
    default: true
  },
  marginRange: {
    min: {
      type: Number,
      default: 10
    },
    max: {
      type: Number,
      default: 50
    }
  },
  attributes: [{
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['text', 'number', 'select', 'multiselect', 'boolean', 'date'],
      default: 'text'
    },
    required: {
      type: Boolean,
      default: false
    },
    options: [String],
    defaultValue: String
  }],
  aiInsights: {
    demandForecast: {
      trend: {
        type: String,
        enum: ['increasing', 'decreasing', 'stable'],
        default: 'stable'
      },
      confidence: {
        type: Number,
        min: 0,
        max: 100,
        default: 50
      },
      nextMonthPrediction: {
        type: Number,
        default: 0
      }
    },
    competitorPricing: {
      averagePrice: Number,
      pricePosition: {
        type: String,
        enum: ['premium', 'competitive', 'budget'],
        default: 'competitive'
      }
    },
    seasonalTrends: [{
      season: String,
      demandMultiplier: Number,
      recommendedMargin: Number
    }]
  }
}, {
  timestamps: true
});

categorySchema.index({ code: 1 });
categorySchema.index({ parentCategory: 1 });
categorySchema.index({ isActive: 1 });

module.exports = mongoose.model('Category', categorySchema);

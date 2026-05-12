const mongoose = require('mongoose');

const catalogProductSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  barcode: {
    type: String,
    trim: true,
    index: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  shortDescription: {
    type: String,
    trim: true,
    maxlength: 500
  },
  specifications: {
    type: Map,
    of: String
  },
  
  // Classification
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  subCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: true
  },
  department: String,
  serviceDepartment: String,
  manufacturer: String,
  
  // Tax & Compliance
  hsnCode: {
    type: String,
    trim: true,
    uppercase: true
  },
  gstRate: {
    type: Number,
    default: 18,
    min: 0,
    max: 28
  },
  cessRate: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Pricing
  pricing: {
    costPrice: {
      type: Number,
      required: true,
      min: 0
    },
    sellingPrice: {
      type: Number,
      required: true,
      min: 0
    },
    mrp: {
      type: Number,
      min: 0
    },
    wholesalePrice: Number,
    onlinePrice: Number,
    membershipPrice: Number,
    happyHourPrice: Number,
    margin: {
      type: Number,
      min: -100,
      max: 100
    },
    marginPercent: {
      type: Number,
      min: -100,
      max: 100
    }
  },
  
  // Inventory
  inventory: {
    currentStock: {
      type: Number,
      default: 0,
      min: 0
    },
    reorderLevel: {
      type: Number,
      default: 10,
      min: 0
    },
    maxStock: {
      type: Number,
      default: 1000,
      min: 0
    },
    stockValue: {
      type: Number,
      default: 0
    },
    averageMonthlySales: {
      type: Number,
      default: 0
    },
    stockTurnover: {
      type: Number,
      default: 0
    },
    expiryDate: Date,
    batchNumber: String,
    warehouseLocation: String,
    storeAvailability: [{
      storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store'
      },
      available: {
        type: Boolean,
        default: true
      },
      stock: {
        type: Number,
        default: 0
      }
    }]
  },
  
  // Media
  images: [{
    url: String,
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    },
    sortOrder: {
      type: Number,
      default: 0
    }
  }],
  videos: [{
    url: String,
    title: String,
    thumbnail: String
  }],
  
  // Status & Settings
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft', 'discontinued', 'out_of_stock'],
    default: 'active'
  },
  isTaxable: {
    type: Boolean,
    default: true
  },
  isReturnable: {
    type: Boolean,
    default: true
  },
  isExpirable: {
    type: Boolean,
    default: false
  },
  trackSerial: {
    type: Boolean,
    default: false
  },
  trackBatch: {
    type: Boolean,
    default: false
  },
  
  // Weight & Dimensions
  weight: {
    gross: Number,
    net: Number,
    unit: {
      type: String,
      enum: ['g', 'kg', 'lb', 'oz'],
      default: 'g'
    }
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: {
      type: String,
      enum: ['cm', 'inch', 'mm'],
      default: 'cm'
    }
  },
  
  // Suppliers
  suppliers: [{
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor'
    },
    supplierCode: String,
    supplierSKU: String,
    leadTimeDays: {
      type: Number,
      default: 7
    },
    minOrderQuantity: {
      type: Number,
      default: 1
    },
    unitPrice: Number,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  
  // AI & Analytics
  aiInsights: {
    healthScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    },
    demandForecast: {
      trend: {
        type: String,
        enum: ['increasing', 'decreasing', 'stable', 'seasonal'],
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
      },
      seasonalFactors: [{
        season: String,
        multiplier: Number,
        confidence: Number
      }]
    },
    pricingInsights: {
      optimalPrice: Number,
      priceElasticity: Number,
      competitorAverage: Number,
      marketPosition: {
        type: String,
        enum: ['premium', 'competitive', 'budget'],
        default: 'competitive'
      },
      recommendations: [{
        type: {
          type: String,
          enum: ['increase', 'decrease', 'maintain'],
          default: 'maintain'
        },
        suggestedPrice: Number,
        expectedImpact: String,
        confidence: Number
      }]
    },
    inventoryInsights: {
      optimalStock: Number,
      overstockRisk: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'low'
      },
      stockoutRisk: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'low'
      },
      reorderRecommendation: {
        quantity: Number,
        urgency: {
          type: String,
          enum: ['immediate', 'week', 'month'],
          default: 'month'
        }
      }
    },
    performanceMetrics: {
      salesVelocity: Number,
      conversionRate: Number,
      returnRate: Number,
      customerRating: {
        type: Number,
        min: 1,
        max: 5,
        default: 3
      },
      profitabilityScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 50
      }
    },
    alerts: [{
      type: {
        type: String,
        enum: ['duplicate_sku', 'low_margin', 'high_return', 'expiry_risk', 'stockout_risk', 'pricing_mismatch'],
        required: true
      },
      severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
      },
      message: String,
      recommendation: String,
      createdAt: {
        type: Date,
        default: Date.now
      },
      resolved: {
        type: Boolean,
        default: false
      }
    }]
  },
  
  // Metadata
  tags: [String],
  searchKeywords: [String],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for performance
catalogProductSchema.index({ sku: 1 });
catalogProductSchema.index({ barcode: 1 });
catalogProductSchema.index({ category: 1 });
catalogProductSchema.index({ brand: 1 });
catalogProductSchema.index({ status: 1 });
catalogProductSchema.index({ 'inventory.currentStock': 1 });
catalogProductSchema.index({ 'pricing.marginPercent': 1 });
catalogProductSchema.index({ 'aiInsights.healthScore': 1 });
catalogProductSchema.index({ tags: 1 });
catalogProductSchema.index({ searchKeywords: 1 });

// Virtual for margin calculation
catalogProductSchema.virtual('calculatedMargin').get(function() {
  if (this.pricing.sellingPrice && this.pricing.costPrice) {
    return ((this.pricing.sellingPrice - this.pricing.costPrice) / this.pricing.sellingPrice) * 100;
  }
  return 0;
});

// Pre-save middleware
catalogProductSchema.pre('save', function(next) {
  // Calculate margin percentage
  if (this.pricing.sellingPrice && this.pricing.costPrice) {
    this.pricing.margin = this.pricing.sellingPrice - this.pricing.costPrice;
    this.pricing.marginPercent = ((this.pricing.sellingPrice - this.pricing.costPrice) / this.pricing.sellingPrice) * 100;
  }
  
  // Calculate stock value
  if (this.inventory.currentStock && this.pricing.costPrice) {
    this.inventory.stockValue = this.inventory.currentStock * this.pricing.costPrice;
  }
  
  next();
});

module.exports = mongoose.model('CatalogProduct', catalogProductSchema);

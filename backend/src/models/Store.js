const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Store name is required'],
    trim: true,
    maxlength: [100, 'Store name cannot exceed 100 characters']
  },
  code: {
    type: String,
    required: [true, 'Store code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true
    },
    zipCode: {
      type: String,
      required: [true, 'Zip code is required'],
      trim: true
    }
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contactPhone: {
    type: String,
    required: [true, 'Contact phone is required'],
    trim: true
  },
  contactEmail: {
    type: String,
    required: [true, 'Contact email is required'],
    trim: true,
    lowercase: true
  },
  warehouseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: true
  },
  type: {
    type: String,
    enum: ['RETAIL', 'WHOLESALE', 'ONLINE', 'HYBRID'],
    default: 'RETAIL'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  operatingHours: {
    monday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    tuesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    wednesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    thursday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    friday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    saturday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    sunday: { open: String, close: String, isOpen: { type: Boolean, default: false } }
  },
  settings: {
    taxRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    currency: {
      type: String,
      default: 'USD'
    },
    lowStockAlertThreshold: {
      type: Number,
      default: 20
    }
  }
}, {
  timestamps: true
});

// Indexes for faster queries
storeSchema.index({ code: 1 });
storeSchema.index({ isActive: 1 });
storeSchema.index({ manager: 1 });
storeSchema.index({ warehouseId: 1 });

module.exports = mongoose.model('Store', storeSchema);

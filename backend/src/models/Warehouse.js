const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Warehouse name is required'],
    trim: true,
    maxlength: [100, 'Warehouse name cannot exceed 100 characters']
  },
  code: {
    type: String,
    required: [true, 'Warehouse code is required'],
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
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: [1, 'Capacity must be at least 1']
  },
  currentOccupancy: {
    type: Number,
    default: 0,
    min: [0, 'Current occupancy cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  operatingHours: {
    open: {
      type: String,
      default: '09:00'
    },
    close: {
      type: String,
      default: '18:00'
    }
  }
}, {
  timestamps: true
});

// Indexes for faster queries
warehouseSchema.index({ code: 1 });
warehouseSchema.index({ isActive: 1 });
warehouseSchema.index({ manager: 1 });

// Virtual for occupancy percentage
warehouseSchema.virtual('occupancyPercentage').get(function() {
  if (this.capacity > 0) {
    return ((this.currentOccupancy / this.capacity) * 100).toFixed(2);
  }
  return 0;
});

module.exports = mongoose.model('Warehouse', warehouseSchema);

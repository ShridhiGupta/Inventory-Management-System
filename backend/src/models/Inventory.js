const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  warehouseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: true
  },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store'
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative']
  },
  reservedQuantity: {
    type: Number,
    default: 0,
    min: [0, 'Reserved quantity cannot be negative']
  },
  availableQuantity: {
    type: Number,
    default: function() {
      return this.quantity - this.reservedQuantity;
    }
  },
  batchNumber: {
    type: String,
    trim: true
  },
  expiryDate: {
    type: Date
  },
  location: {
    aisle: String,
    rack: String,
    shelf: String,
    bin: String
  },
  lastStockUpdate: {
    type: Date,
    default: Date.now
  },
  costPerUnit: {
    type: Number,
    required: [true, 'Cost per unit is required'],
    min: [0, 'Cost per unit cannot be negative']
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'DAMAGED', 'EXPIRED', 'IN_TRANSIT', 'RESERVED'],
    default: 'ACTIVE'
  }
}, {
  timestamps: true
});

// Compound index for unique inventory records
inventorySchema.index({ productId: 1, warehouseId: 1, storeId: 1 }, { unique: true });
inventorySchema.index({ productId: 1 });
inventorySchema.index({ warehouseId: 1 });
inventorySchema.index({ storeId: 1 });
inventorySchema.index({ status: 1 });
inventorySchema.index({ expiryDate: 1 });

// Pre-save middleware to update available quantity
inventorySchema.pre('save', function(next) {
  this.availableQuantity = this.quantity - this.reservedQuantity;
  this.lastStockUpdate = new Date();
  next();
});

// Static method to check low stock
inventorySchema.statics.checkLowStock = function(threshold = 20) {
  return this.find({
    $expr: { $lte: ['$availableQuantity', threshold] },
    status: 'ACTIVE'
  }).populate('productId');
};

// Virtual for total value
inventorySchema.virtual('totalValue').get(function() {
  return this.quantity * this.costPerUnit;
});

module.exports = mongoose.model('Inventory', inventorySchema);

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  barcode: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['ELECTRONICS', 'CLOTHING', 'FOOD', 'FURNITURE', 'BOOKS', 'TOYS', 'SPORTS', 'BEAUTY', 'AUTOMOTIVE', 'OTHER']
  },
  brand: {
    type: String,
    trim: true
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['PIECES', 'KG', 'LITERS', 'METERS', 'BOXES', 'PACKETS', 'BOTTLES', 'CANS']
  },
  costPrice: {
    type: Number,
    required: [true, 'Cost price is required'],
    min: [0, 'Cost price cannot be negative']
  },
  sellingPrice: {
    type: Number,
    required: [true, 'Selling price is required'],
    min: [0, 'Selling price cannot be negative']
  },
  minStockLevel: {
    type: Number,
    default: 10,
    min: [0, 'Minimum stock level cannot be negative']
  },
  maxStockLevel: {
    type: Number,
    default: 1000,
    min: [0, 'Maximum stock level cannot be negative']
  },
  images: [{
    type: String
  }],
  specifications: {
    type: Map,
    of: String
  },
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for faster queries
productSchema.index({ sku: 1 });
productSchema.index({ category: 1 });
productSchema.index({ vendorId: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Virtual for profit margin
productSchema.virtual('profitMargin').get(function() {
  if (this.sellingPrice && this.costPrice) {
    return ((this.sellingPrice - this.costPrice) / this.costPrice * 100).toFixed(2);
  }
  return 0;
});

module.exports = mongoose.model('Product', productSchema);

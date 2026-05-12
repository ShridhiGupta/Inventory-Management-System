const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionNumber: {
    type: String,
    required: [true, 'Transaction number is required'],
    unique: true,
    uppercase: true
  },
  type: {
    type: String,
    required: [true, 'Transaction type is required'],
    enum: ['PURCHASE', 'SALE', 'TRANSFER', 'RETURN', 'ADJUSTMENT', 'DAMAGE']
  },
  status: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'CANCELLED', 'PARTIAL'],
    default: 'PENDING'
  },
  fromLocation: {
    type: String,
    enum: ['WAREHOUSE', 'STORE', 'VENDOR'],
    required: true
  },
  toLocation: {
    type: String,
    enum: ['WAREHOUSE', 'STORE', 'CUSTOMER'],
    required: true
  },
  fromLocationId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  toLocationId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1']
    },
    unitPrice: {
      type: Number,
      required: [true, 'Unit price is required'],
      min: [0, 'Unit price cannot be negative']
    },
    totalPrice: {
      type: Number,
      required: true,
      min: [0, 'Total price cannot be negative']
    },
    batchNumber: {
      type: String,
      trim: true
    }
  }],
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  taxAmount: {
    type: Number,
    default: 0,
    min: [0, 'Tax amount cannot be negative']
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: [0, 'Discount amount cannot be negative']
  },
  finalAmount: {
    type: Number,
    required: [true, 'Final amount is required'],
    min: [0, 'Final amount cannot be negative']
  },
  paymentMethod: {
    type: String,
    enum: ['CASH', 'CARD', 'BANK_TRANSFER', 'CREDIT', 'ONLINE'],
    required: function() {
      return this.type === 'SALE';
    }
  },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'PAID', 'PARTIAL', 'OVERDUE'],
    default: 'PENDING'
  },
  referenceNumber: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  transactionDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for faster queries
transactionSchema.index({ transactionNumber: 1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ transactionDate: -1 });
transactionSchema.index({ createdBy: 1 });
transactionSchema.index({ fromLocationId: 1 });
transactionSchema.index({ toLocationId: 1 });

// Pre-save middleware to calculate totals
transactionSchema.pre('save', function(next) {
  // Calculate total amount from items
  this.totalAmount = this.items.reduce((total, item) => {
    return total + (item.quantity * item.unitPrice);
  }, 0);
  
  // Calculate final amount
  this.finalAmount = this.totalAmount + this.taxAmount - this.discountAmount;
  
  // Generate transaction number if not provided
  if (!this.transactionNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.transactionNumber = `TRX-${year}${month}${day}-${random}`;
  }
  
  next();
});

module.exports = mongoose.model('Transaction', transactionSchema);

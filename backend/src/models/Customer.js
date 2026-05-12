const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true,
    required: [true, 'Phone number is required']
  },
  address: {
    street: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      trim: true
    },
    zipCode: {
      type: String,
      trim: true
    }
  },
  company: {
    type: String,
    trim: true
  },
  taxId: {
    type: String,
    trim: true
  },
  creditLimit: {
    type: Number,
    default: 0,
    min: [0, 'Credit limit cannot be negative']
  },
  currentBalance: {
    type: Number,
    default: 0,
    min: [0, 'Current balance cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  }
}, {
  timestamps: true
});

// Indexes for faster queries
customerSchema.index({ firstName: 1, lastName: 1 });
customerSchema.index({ email: 1 });
customerSchema.index({ phone: 1 });
customerSchema.index({ isActive: 1 });

// Virtual for full name
customerSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Static method to find customers by name
customerSchema.statics.findByName = function(name) {
  return this.find({
    $or: [
      { firstName: { $regex: name, $options: 'i' } },
      { lastName: { $regex: name, $options: 'i' } }
    ]
  });
};

module.exports = mongoose.model('Customer', customerSchema);

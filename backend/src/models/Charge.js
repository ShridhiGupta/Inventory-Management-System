const mongoose = require('mongoose');

const chargeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  chargeType: {
    type: String,
    enum: ['FIXED', 'PERCENTAGE'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  applicableOn: {
    type: String,
    enum: ['ORDER', 'PRODUCT', 'SHIPPING'],
    default: 'ORDER'
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE'
  },
  description: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Charge', chargeSchema);

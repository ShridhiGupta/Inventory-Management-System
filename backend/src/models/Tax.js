const mongoose = require('mongoose');

const taxSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  percentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  taxType: {
    type: String,
    enum: ['GST', 'VAT', 'SALES_TAX', 'OTHER'],
    default: 'GST'
  },
  hsnSacCode: {
    type: String,
    trim: true
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

module.exports = mongoose.model('Tax', taxSchema);

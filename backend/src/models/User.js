const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
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
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  role: {
    type: String,
    enum: ['SUPER_ADMIN', 'STORE_ADMIN', 'VENDOR_ADMIN', 'TRANSACTION_ADMIN'],
    default: 'STORE_ADMIN'
  },
  phone: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  permissions: [{
    type: String
  }],
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store'
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor'
  },
  /** UI / alert state persisted in DB (see migrations + /auth/notifications/mark-seen) */
  preferences: {
    notificationSeenAlertIds: {
      type: [String],
      default: []
    }
  }
}, {
  timestamps: true
});

userSchema.index({ role: 1 });

// Pre-save middleware to hash password (Mongoose 8+: async hooks omit `next`)
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const bcrypt = require('bcryptjs');
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  const bcrypt = require('bcryptjs');
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get user profile without password
userSchema.methods.toProfileJSON = function() {
  return {
    id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    email: this.email,
    role: this.role,
    phone: this.phone,
    avatar: this.avatar,
    isActive: this.isActive,
    lastLogin: this.lastLogin,
    permissions: this.permissions,
    storeId: this.storeId,
    vendorId: this.vendorId,
    preferences: this.preferences || { notificationSeenAlertIds: [] },
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

module.exports = mongoose.model('User', userSchema);

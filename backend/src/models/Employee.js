const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
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
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: ['SUPER_ADMIN', 'STORE_ADMIN', 'VENDOR_ADMIN', 'TRANSACTION_ADMIN', 'STORE_MANAGER', 'WAREHOUSE_MANAGER', 'SALES_ASSOCIATE', 'CASHIER']
  },
  position: {
    type: String,
    required: [true, 'Position is required'],
    trim: true,
    maxlength: [100, 'Position cannot exceed 100 characters']
  },
  department: {
    type: String,
    enum: ['MANAGEMENT', 'SALES', 'WAREHOUSE', 'FINANCE', 'IT', 'HR'],
    default: 'SALES'
  },
  hireDate: {
    type: Date,
    required: [true, 'Hire date is required'],
    default: Date.now
  },
  salary: {
    type: Number,
    required: [true, 'Salary is required'],
    min: [0, 'Salary cannot be negative']
  },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store'
  },
  warehouseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse'
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor'
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  reports: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  }],
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
  emergencyContact: {
    name: {
      type: String,
      trim: true
    },
    relationship: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    }
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
employeeSchema.index({ email: 1 });
employeeSchema.index({ role: 1 });
employeeSchema.index({ department: 1 });
employeeSchema.index({ storeId: 1 });
employeeSchema.index({ warehouseId: 1 });
employeeSchema.index({ vendorId: 1 });
employeeSchema.index({ isActive: 1 });

// Virtual for full name
employeeSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save middleware to hash password if this is used for authentication
employeeSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Method to compare password
employeeSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  const bcrypt = require('bcryptjs');
  return await bcrypt.compare(candidatePassword, this.password);
};

// Static method to find employees by role
employeeSchema.statics.findByRole = function(role) {
  return this.find({ role, isActive: true });
};

// Static method to find employees by store
employeeSchema.statics.findByStore = function(storeId) {
  return this.find({ storeId, isActive: true });
};

module.exports = mongoose.model('Employee', employeeSchema);

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid token or user not active.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired.' });
    }
    res.status(500).json({ message: 'Server error during authentication.' });
  }
};

// Role-based access control middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Access denied. Authentication required.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Access denied. Insufficient permissions.',
        required: roles,
        current: req.user.role
      });
    }

    next();
  };
};

// Permission-based access control middleware
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Access denied. Authentication required.' });
    }

    // Super admin has all permissions
    if (req.user.role === 'SUPER_ADMIN') {
      return next();
    }

    if (!req.user.permissions.includes(permission)) {
      return res.status(403).json({ 
        message: 'Access denied. Required permission missing.',
        required: permission
      });
    }

    next();
  };
};

// Store access middleware (for store-specific operations)
const requireStoreAccess = async (req, res, next) => {
  try {
    const { storeId } = req.params;
    
    // Super admin can access any store
    if (req.user.role === 'SUPER_ADMIN') {
      return next();
    }

    // Store admin can only access their own store
    if (req.user.role === 'STORE_ADMIN') {
      if (req.user.storeId?.toString() !== storeId) {
        return res.status(403).json({ message: 'Access denied. Can only access your own store.' });
      }
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error during store access validation.' });
  }
};

// Vendor access middleware (for vendor-specific operations)
const requireVendorAccess = async (req, res, next) => {
  try {
    const { vendorId } = req.params;
    
    // Super admin can access any vendor
    if (req.user.role === 'SUPER_ADMIN') {
      return next();
    }

    // Vendor admin can only access their own vendor
    if (req.user.role === 'VENDOR_ADMIN') {
      if (req.user.vendorId?.toString() !== vendorId) {
        return res.status(403).json({ message: 'Access denied. Can only access your own vendor data.' });
      }
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error during vendor access validation.' });
  }
};

module.exports = {
  authenticate,
  authorize,
  requirePermission,
  requireStoreAccess,
  requireVendorAccess
};

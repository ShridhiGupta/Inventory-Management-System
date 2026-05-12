const mongoose = require('mongoose');
const OrganizationSettings = require('../models/OrganizationSettings');

const DEFAULT_KEY = 'default';

async function getOrCreateDoc() {
  let doc = await OrganizationSettings.findOne({ organizationKey: DEFAULT_KEY });
  if (!doc) {
    doc = await OrganizationSettings.create({ organizationKey: DEFAULT_KEY });
  }
  return doc;
}

function stripSecrets(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const clone = JSON.parse(JSON.stringify(obj));
  if (clone.system) {
    delete clone.system.smtpPassword;
    if (clone.system.smtpUser) {
      clone.system.smtpConfigured = true;
    }
  }
  return clone;
}

/**
 * GET /api/settings/organization
 */
const getOrganizationSettings = async (req, res) => {
  try {
    const doc = await getOrCreateDoc();
    const plain = doc.toObject();
    delete plain.system?.smtpPassword;
    if (plain.system?.smtpUser) {
      plain.system.smtpConfigured = true;
    }
    res.json({
      message: 'Organization settings retrieved',
      settings: stripSecrets(plain)
    });
  } catch (error) {
    console.error('getOrganizationSettings', error);
    res.status(500).json({ message: 'Failed to load organization settings' });
  }
};

function isSuperAdmin(user) {
  return user?.role === 'SUPER_ADMIN';
}

function isAdminLevel(user) {
  return ['SUPER_ADMIN', 'STORE_ADMIN'].includes(user?.role);
}

/**
 * PUT /api/settings/organization
 * Partial merge by section keys: general, invoice, theme, system, integrations, security, notificationDefaults
 */
const updateOrganizationSettings = async (req, res) => {
  try {
    const user = req.user;
    const body = req.body || {};

    const storeAdminSections = new Set(['general', 'invoice', 'theme', 'notificationDefaults']);

    if (!isSuperAdmin(user) && !isAdminLevel(user)) {
      return res.status(403).json({ message: 'Insufficient permissions to update settings' });
    }

    for (const key of Object.keys(body)) {
      if (key === '_id' || key === 'organizationKey') continue;
      if (isSuperAdmin(user)) continue;
      if (!storeAdminSections.has(key)) {
        return res.status(403).json({
          message: 'Only SUPER_ADMIN can update this section',
          section: key
        });
      }
    }

    const doc = await getOrCreateDoc();

    const sections = [
      'general',
      'invoice',
      'theme',
      'system',
      'integrations',
      'security',
      'notificationDefaults'
    ];
    for (const section of sections) {
      if (body[section] && typeof body[section] === 'object') {
        doc[section] = doc[section] || {};
        Object.assign(doc[section], body[section]);
      }
    }

    if (body.system?.smtpPassword === '') {
      doc.system.smtpPassword = undefined;
    } else if (body.system?.smtpPassword) {
      doc.system.smtpPassword = body.system.smtpPassword;
    }

    doc.markModified('general');
    doc.markModified('invoice');
    doc.markModified('theme');
    doc.markModified('system');
    doc.markModified('integrations');
    doc.markModified('security');
    doc.markModified('notificationDefaults');

    await doc.save();

    const plain = doc.toObject();
    delete plain.system?.smtpPassword;
    if (plain.system?.smtpUser) {
      plain.system.smtpConfigured = true;
    }

    res.json({
      message: 'Settings saved',
      settings: stripSecrets(plain)
    });
  } catch (error) {
    console.error('updateOrganizationSettings', error);
    res.status(500).json({ message: 'Failed to save organization settings' });
  }
};

/**
 * GET /api/settings/system-status
 */
const getSystemStatus = async (req, res) => {
  try {
    if (!isSuperAdmin(req.user)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const readyState = mongoose.connection.readyState;
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    res.json({
      message: 'System status',
      database: {
        state: states[readyState] || String(readyState),
        host: mongoose.connection.host || null,
        name: mongoose.connection.name || null
      },
      process: {
        nodeEnv: process.env.NODE_ENV || 'development',
        uptimeSec: Math.floor(process.uptime())
      }
    });
  } catch (error) {
    console.error('getSystemStatus', error);
    res.status(500).json({ message: 'Failed to read system status' });
  }
};

/**
 * GET /api/settings/access-matrix
 * Read-only catalog for UI (permissions enforced in middleware / future RBAC service).
 */
const getAccessMatrix = async (req, res) => {
  try {
    res.json({
      message: 'Access matrix catalog',
      roles: [
        {
          id: 'SUPER_ADMIN',
          label: 'Super Admin',
          description: 'Full tenant access including system & security settings',
          permissions: ['*']
        },
        {
          id: 'STORE_ADMIN',
          label: 'Store Admin',
          description: 'Inventory, stores, billing operations',
          permissions: ['inventory.*', 'store.*', 'transaction.*', 'reports.read', 'settings.org']
        },
        {
          id: 'VENDOR_ADMIN',
          label: 'Vendor Admin',
          description: 'Vendor catalog and purchase-related views',
          permissions: ['vendor.self', 'inventory.read']
        },
        {
          id: 'TRANSACTION_ADMIN',
          label: 'Transaction Admin',
          description: 'Sales, purchases, returns processing',
          permissions: ['transaction.*', 'inventory.read']
        }
      ],
      notes: ['Fine-grained RBAC can be extended via User.permissions and middleware.']
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load access matrix' });
  }
};

module.exports = {
  getOrganizationSettings,
  updateOrganizationSettings,
  getSystemStatus,
  getAccessMatrix
};

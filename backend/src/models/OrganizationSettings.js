const mongoose = require('mongoose');

/**
 * Singleton org settings (organizationKey: default) — ERP-style configuration.
 * Secrets use select:false; never log raw passwords.
 */
const organizationSettingsSchema = new mongoose.Schema(
  {
    organizationKey: { type: String, default: 'default', unique: true, index: true },

    general: {
      companyName: { type: String, trim: true, maxlength: 200 },
      businessLogo: { type: String, trim: true, maxlength: 2000 },
      gstNumber: { type: String, trim: true, maxlength: 32 },
      currency: { type: String, default: 'USD', maxlength: 8 },
      timezone: { type: String, default: 'UTC', maxlength: 64 },
      language: { type: String, default: 'en', maxlength: 16 }
    },

    invoice: {
      prefix: { type: String, default: 'INV', trim: true, maxlength: 32 },
      taxRatePercent: { type: Number, min: 0, max: 100 },
      billingTerms: { type: String, trim: true, maxlength: 2000 },
      templateId: { type: String, trim: true, maxlength: 64 }
    },

    theme: {
      mode: { type: String, enum: ['light', 'dark', 'system'], default: 'dark' },
      sidebarStyle: { type: String, enum: ['wide', 'compact', 'floating'], default: 'wide' },
      accentColor: { type: String, default: 'cyan', maxlength: 32 },
      layoutDensity: { type: String, enum: ['comfortable', 'compact'], default: 'comfortable' }
    },

    system: {
      emailFromName: { type: String, trim: true, maxlength: 128 },
      smtpHost: { type: String, trim: true, maxlength: 256 },
      smtpPort: { type: Number, min: 1, max: 65535 },
      smtpSecure: { type: Boolean, default: true },
      smtpUser: { type: String, trim: true, maxlength: 256 },
      smtpPassword: { type: String, select: false, maxlength: 256 },
      backupEnabled: { type: Boolean, default: false },
      backupCron: { type: String, trim: true, maxlength: 64 },
      backupRetentionDays: { type: Number, min: 1, max: 365, default: 14 },
      externalApiEnvHint: { type: String, trim: true, maxlength: 2000 }
    },

    integrations: {
      paymentGatewayProvider: { type: String, trim: true, maxlength: 64 },
      paymentGatewayMode: { type: String, enum: ['test', 'live', 'disabled'], default: 'disabled' },
      paymentGatewayKeyHint: { type: String, trim: true, maxlength: 256 },
      emailProvider: { type: String, trim: true, maxlength: 64 },
      smsProvider: { type: String, trim: true, maxlength: 64 },
      customWebhooks: [
        {
          name: { type: String, trim: true, maxlength: 100 },
          url: { type: String, trim: true, maxlength: 2000 },
          active: { type: Boolean, default: true }
        }
      ]
    },

    security: {
      jwtSessionTimeoutMinutes: { type: Number, min: 5, max: 10080, default: 10080 },
      twoFactorEnforced: { type: Boolean, default: false },
      ipAllowlist: [{ type: String, trim: true, maxlength: 64 }],
      auditRetentionDays: { type: Number, min: 1, max: 3650, default: 90 }
    },

    notificationDefaults: {
      emailDigest: { type: Boolean, default: true },
      lowStockAlerts: { type: Boolean, default: true },
      transactionAlerts: { type: Boolean, default: true }
    }
  },
  { timestamps: true }
);

organizationSettingsSchema.methods.toSafeJSON = function toSafeJSON() {
  const o = this.toObject({ getters: true, virtuals: false });
  delete o.smtpPassword;
  return o;
};

module.exports = mongoose.model('OrganizationSettings', organizationSettingsSchema);

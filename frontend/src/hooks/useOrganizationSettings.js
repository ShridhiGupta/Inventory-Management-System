import { useCallback, useEffect, useState } from 'react';
import api from '../lib/api';
import { getApiErrorMessage } from '../lib/http';

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

const defaults = {
  general: {
    companyName: '',
    businessLogo: '',
    gstNumber: '',
    currency: 'USD',
    timezone: 'UTC',
    language: 'en'
  },
  invoice: {
    prefix: 'INV',
    taxRatePercent: 0,
    billingTerms: '',
    templateId: 'standard'
  },
  theme: {
    mode: 'dark',
    sidebarStyle: 'wide',
    accentColor: 'cyan',
    layoutDensity: 'comfortable'
  },
  system: {
    emailFromName: '',
    smtpHost: '',
    smtpPort: 587,
    smtpSecure: true,
    smtpUser: '',
    backupEnabled: false,
    backupCron: '0 2 * * *',
    backupRetentionDays: 14,
    externalApiEnvHint: ''
  },
  integrations: {
    paymentGatewayProvider: '',
    paymentGatewayMode: 'disabled',
    paymentGatewayKeyHint: '',
    emailProvider: '',
    smsProvider: '',
    customWebhooks: []
  },
  security: {
    jwtSessionTimeoutMinutes: 10080,
    twoFactorEnforced: false,
    ipAllowlist: [],
    auditRetentionDays: 90
  },
  notificationDefaults: {
    emailDigest: true,
    lowStockAlerts: true,
    transactionAlerts: true
  }
};

function deepMerge(base, patch) {
  if (!patch || typeof patch !== 'object') return { ...base };
  const out = { ...base };
  for (const k of Object.keys(patch)) {
    const v = patch[k];
    if (v && typeof v === 'object' && !Array.isArray(v) && base[k] && typeof base[k] === 'object') {
      out[k] = deepMerge(base[k], v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

export function useOrganizationSettings() {
  const [settings, setSettings] = useState(() => clone(defaults));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/settings/organization');
      const s = data.settings;
      setSettings(
        deepMerge(clone(defaults), {
          general: s.general,
          invoice: s.invoice,
          theme: s.theme,
          system: { ...(s.system || {}), smtpPassword: '' },
          integrations: s.integrations,
          security: s.security,
          notificationDefaults: s.notificationDefaults
        })
      );
    } catch (e) {
      setError(getApiErrorMessage(e, 'Failed to load settings.'));
      setSettings(clone(defaults));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveSection = useCallback(async (sectionKey, patch) => {
    setSaving(true);
    setError('');
    try {
      const body = { [sectionKey]: patch };
      const { data } = await api.put('/settings/organization', body);
      const s = data.settings;
      setSettings((prev) =>
        deepMerge(prev, {
          [sectionKey]: s[sectionKey]
        })
      );
      return true;
    } catch (e) {
      setError(getApiErrorMessage(e, 'Save failed.'));
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  return { settings, setSettings, loading, saving, error, reload: load, saveSection, defaults };
}

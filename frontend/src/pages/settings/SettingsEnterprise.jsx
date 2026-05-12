import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  UserCircle,
  Shield,
  Server,
  FileText,
  Palette,
  Plug,
  Lock,
  ChevronRight
} from 'lucide-react';
import Header from '../../components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import UserAccountPanel from '../../components/settings/UserAccountPanel';
import { useOrganizationSettings } from '../../hooks/useOrganizationSettings';
import { useThemeSettings } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import api from '../../lib/api';
import { cn } from '../../lib/utils';
import { getApiErrorMessage } from '../../lib/http';

const TABS = [
  { id: 'general', label: 'General', icon: Building2, roles: ['ALL'] },
  { id: 'account', label: 'User & account', icon: UserCircle, roles: ['ALL'] },
  { id: 'access', label: 'Roles & access', icon: Shield, roles: ['ALL'] },
  { id: 'system', label: 'System', icon: Server, roles: ['SUPER_ADMIN'] },
  { id: 'invoice', label: 'Invoice', icon: FileText, roles: ['SUPER_ADMIN', 'STORE_ADMIN'] },
  { id: 'theme', label: 'Theme', icon: Palette, roles: ['SUPER_ADMIN', 'STORE_ADMIN'] },
  { id: 'integrations', label: 'Integrations', icon: Plug, roles: ['SUPER_ADMIN'] },
  { id: 'security', label: 'Security', icon: Lock, roles: ['SUPER_ADMIN'] }
];

function canViewTab(tab, role) {
  if (tab.roles.includes('ALL')) return true;
  return tab.roles.includes(role);
}

export default function SettingsEnterprise({ user, onProfileUpdate }) {
  const role = user?.role || '';
  const isSuper = role === 'SUPER_ADMIN';
  const { toast } = useToast();
  const { settings, setSettings, loading, saving, error, saveSection, reload } =
    useOrganizationSettings();
  const { setMode, setAccentColor } = useThemeSettings();
  const [active, setActive] = useState('general');
  const [matrix, setMatrix] = useState(null);
  const [sysStatus, setSysStatus] = useState(null);

  useEffect(() => {
    let c = false;
    api
      .get('/settings/access-matrix')
      .then((r) => !c && setMatrix(r.data))
      .catch(() => {});
    return () => {
      c = true;
    };
  }, []);

  useEffect(() => {
    if (active !== 'system' || !isSuper) return;
    let c = false;
    api
      .get('/settings/system-status')
      .then((r) => !c && setSysStatus(r.data))
      .catch(() => !c && setSysStatus(null));
    return () => {
      c = true;
    };
  }, [active, isSuper]);

  const saveGeneral = async (e) => {
    e.preventDefault();
    const ok = await saveSection('general', settings.general);
    if (ok) toast('General settings saved', 'success');
    else toast('Could not save general settings', 'error');
  };

  const saveInvoice = async (e) => {
    e.preventDefault();
    const ok = await saveSection('invoice', settings.invoice);
    if (ok) toast('Invoice settings saved', 'success');
    else toast('Save failed', 'error');
  };

  const saveTheme = async (e) => {
    e.preventDefault();
    const ok = await saveSection('theme', settings.theme);
    if (ok) {
      setMode(settings.theme.mode);
      setAccentColor(settings.theme.accentColor);
      toast('Theme saved', 'success');
    } else toast('Save failed', 'error');
  };

  const saveSystem = async (e) => {
    e.preventDefault();
    const payload = { ...settings.system };
    if (!payload.smtpPassword) delete payload.smtpPassword;
    const ok = await saveSection('system', payload);
    if (ok) toast('System settings saved', 'success');
    else toast('Save failed', 'error');
  };

  const saveIntegrations = async (e) => {
    e.preventDefault();
    const ok = await saveSection('integrations', settings.integrations);
    if (ok) toast('Integrations saved', 'success');
    else toast('Save failed', 'error');
  };

  const saveSecurity = async (e) => {
    e.preventDefault();
    const ok = await saveSection('security', settings.security);
    if (ok) toast('Security policy saved', 'success');
    else toast('Save failed', 'error');
  };

  const onPatchNotifications = useCallback(
    async (patch) => {
      const next = { ...settings.notificationDefaults, ...patch };
      setSettings((s) => ({ ...s, notificationDefaults: next }));
      const ok = await saveSection('notificationDefaults', next);
      if (ok) toast('Notification defaults updated', 'success');
      else toast('Could not save', 'error');
    },
    [settings.notificationDefaults, saveSection, setSettings, toast]
  );

  const visibleTabs = TABS.filter((t) => canViewTab(t, role));

  useEffect(() => {
    if (!canViewTab(TABS.find((t) => t.id === active) || TABS[0], role) && visibleTabs[0]) {
      setActive(visibleTabs[0].id);
    }
  }, [role, visibleTabs, active]);

  return (
    <div className="min-h-screen bg-slate-950 pb-16">
      <Header title="Settings" user={user} />

      <div className="mx-auto max-w-7xl px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <h2 className="text-xl font-semibold text-white">Organization</h2>
            <p className="text-sm text-slate-500">
              Enterprise configuration — changes persist to MongoDB via{' '}
              <code className="text-cyan-400">PUT /api/settings/organization</code>
            </p>
          </div>
          <Button type="button" variant="outline" className="border-white/20" onClick={reload}>
            Reload
          </Button>
        </motion.div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-6 lg:flex-row">
          <aside className="lg:w-64 lg:shrink-0">
            <nav className="flex flex-row gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
              {visibleTabs.map((tab) => {
                const Icon = tab.icon;
                const on = active === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActive(tab.id)}
                    className={cn(
                      'flex min-w-[9.5rem] items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition-colors lg:min-w-0',
                      on
                        ? 'border border-cyan-500/30 bg-cyan-500/10 text-white'
                        : 'border border-transparent text-slate-400 hover:bg-white/5 hover:text-white'
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <Icon className="h-4 w-4 shrink-0 text-cyan-400" />
                      {tab.label}
                    </span>
                    <ChevronRight className={cn('h-4 w-4 opacity-0', on && 'opacity-100')} />
                  </button>
                );
              })}
            </nav>
          </aside>

          <div className="min-w-0 flex-1">
            {loading ? (
              <div className="flex justify-center py-24">
                <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-cyan-500" />
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {active === 'general' && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg text-white">General</CardTitle>
                        <p className="text-xs text-slate-500">Company profile & regional defaults.</p>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={saveGeneral} className="grid gap-4 sm:grid-cols-2">
                          {[
                            ['companyName', 'Company name'],
                            ['gstNumber', 'GST / Tax ID'],
                            ['currency', 'Currency code'],
                            ['timezone', 'Timezone (IANA)'],
                            ['language', 'Language (ISO)'],
                            ['businessLogo', 'Logo URL']
                          ].map(([field, label]) => (
                            <label key={field} className={field === 'businessLogo' ? 'sm:col-span-2' : ''}>
                              <span className="mb-1 block text-xs font-medium text-slate-400">{label}</span>
                              <input
                                className="modern-input w-full px-3 py-2"
                                value={settings.general[field] || ''}
                                onChange={(e) =>
                                  setSettings((s) => ({
                                    ...s,
                                    general: { ...s.general, [field]: e.target.value }
                                  }))
                                }
                              />
                            </label>
                          ))}
                          <div className="sm:col-span-2">
                            <Button type="submit" disabled={saving}>
                              {saving ? 'Saving…' : 'Save general'}
                            </Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  )}

                  {active === 'account' && (
                    <UserAccountPanel
                      user={user}
                      onProfileUpdate={onProfileUpdate}
                      notificationDefaults={settings.notificationDefaults}
                      onPatchNotifications={onPatchNotifications}
                    />
                  )}

                  {active === 'access' && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg text-white">Role & access matrix</CardTitle>
                        <p className="text-xs text-slate-500">
                          Read-only catalog from API — enforce in middleware and user permissions.
                        </p>
                      </CardHeader>
                      <CardContent className="overflow-x-auto">
                        <table className="w-full min-w-[640px] text-left text-sm">
                          <thead>
                            <tr className="border-b border-white/10 text-slate-500">
                              <th className="py-2 pr-4">Role</th>
                              <th className="py-2 pr-4">Description</th>
                              <th className="py-2">Permissions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(matrix?.roles || []).map((r) => (
                              <tr key={r.id} className="border-b border-white/5">
                                <td className="py-3 font-medium text-white">{r.label}</td>
                                <td className="py-3 text-slate-400">{r.description}</td>
                                <td className="py-3 text-xs text-cyan-200">
                                  {(r.permissions || []).join(', ')}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <p className="mt-4 text-xs text-slate-600">
                          {matrix?.notes?.[0] ||
                            'Map fine-grained RBAC with User.permissions and route guards.'}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {active === 'system' && isSuper && (
                    <div className="space-y-6">
                      {sysStatus && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-white">Database status</CardTitle>
                          </CardHeader>
                          <CardContent className="grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
                            <div>
                              State: <span className="text-white">{sysStatus.database?.state}</span>
                            </div>
                            <div>
                              DB name:{' '}
                              <span className="text-white">{sysStatus.database?.name || '—'}</span>
                            </div>
                            <div>
                              Uptime:{' '}
                              <span className="text-white">{sysStatus.process?.uptimeSec}s</span>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-white">Email (SMTP)</CardTitle>
                          <p className="text-xs text-slate-500">
                            Secrets stored server-side; password never returned in GET.
                          </p>
                        </CardHeader>
                        <CardContent>
                          <form onSubmit={saveSystem} className="grid gap-4 sm:grid-cols-2">
                            <label className="sm:col-span-2">
                              <span className="mb-1 block text-xs text-slate-400">From name</span>
                              <input
                                className="modern-input w-full px-3 py-2"
                                value={settings.system.emailFromName || ''}
                                onChange={(e) =>
                                  setSettings((s) => ({
                                    ...s,
                                    system: { ...s.system, emailFromName: e.target.value }
                                  }))
                                }
                              />
                            </label>
                            <label>
                              <span className="mb-1 block text-xs text-slate-400">SMTP host</span>
                              <input
                                className="modern-input w-full px-3 py-2"
                                value={settings.system.smtpHost || ''}
                                onChange={(e) =>
                                  setSettings((s) => ({
                                    ...s,
                                    system: { ...s.system, smtpHost: e.target.value }
                                  }))
                                }
                              />
                            </label>
                            <label>
                              <span className="mb-1 block text-xs text-slate-400">SMTP port</span>
                              <input
                                type="number"
                                className="modern-input w-full px-3 py-2"
                                value={settings.system.smtpPort ?? 587}
                                onChange={(e) =>
                                  setSettings((s) => ({
                                    ...s,
                                    system: { ...s.system, smtpPort: Number(e.target.value) }
                                  }))
                                }
                              />
                            </label>
                            <label>
                              <span className="mb-1 block text-xs text-slate-400">SMTP user</span>
                              <input
                                className="modern-input w-full px-3 py-2"
                                value={settings.system.smtpUser || ''}
                                onChange={(e) =>
                                  setSettings((s) => ({
                                    ...s,
                                    system: { ...s.system, smtpUser: e.target.value }
                                  }))
                                }
                              />
                            </label>
                            <label>
                              <span className="mb-1 block text-xs text-slate-400">
                                SMTP password (leave blank to keep)
                              </span>
                              <input
                                type="password"
                                autoComplete="new-password"
                                className="modern-input w-full px-3 py-2"
                                value={settings.system.smtpPassword || ''}
                                placeholder="••••••••"
                                onChange={(e) =>
                                  setSettings((s) => ({
                                    ...s,
                                    system: { ...s.system, smtpPassword: e.target.value }
                                  }))
                                }
                              />
                            </label>
                            <label className="flex items-center gap-2 sm:col-span-2">
                              <input
                                type="checkbox"
                                checked={!!settings.system.smtpSecure}
                                onChange={(e) =>
                                  setSettings((s) => ({
                                    ...s,
                                    system: { ...s.system, smtpSecure: e.target.checked }
                                  }))
                                }
                              />
                              <span className="text-sm text-slate-300">TLS / SSL</span>
                            </label>
                            <label className="sm:col-span-2">
                              <span className="mb-1 block text-xs text-slate-400">
                                Env / deployment notes (non-secret)
                              </span>
                              <textarea
                                rows={3}
                                className="modern-input w-full px-3 py-2"
                                value={settings.system.externalApiEnvHint || ''}
                                onChange={(e) =>
                                  setSettings((s) => ({
                                    ...s,
                                    system: { ...s.system, externalApiEnvHint: e.target.value }
                                  }))
                                }
                              />
                            </label>
                            <div className="sm:col-span-2">
                              <Button type="submit" disabled={saving}>
                                Save system settings
                              </Button>
                            </div>
                          </form>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {active === 'invoice' && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-white">Invoice & tax</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={saveInvoice} className="grid max-w-xl gap-4">
                          <label>
                            <span className="mb-1 block text-xs text-slate-400">Invoice prefix</span>
                            <input
                              className="modern-input w-full px-3 py-2"
                              value={settings.invoice.prefix || ''}
                              onChange={(e) =>
                                setSettings((s) => ({
                                  ...s,
                                  invoice: { ...s.invoice, prefix: e.target.value }
                                }))
                              }
                            />
                          </label>
                          <label>
                            <span className="mb-1 block text-xs text-slate-400">Tax rate (%)</span>
                            <input
                              type="number"
                              step="0.01"
                              className="modern-input w-full px-3 py-2"
                              value={settings.invoice.taxRatePercent ?? 0}
                              onChange={(e) =>
                                setSettings((s) => ({
                                  ...s,
                                  invoice: {
                                    ...s.invoice,
                                    taxRatePercent: Number(e.target.value)
                                  }
                                }))
                              }
                            />
                          </label>
                          <label>
                            <span className="mb-1 block text-xs text-slate-400">Billing terms</span>
                            <textarea
                              rows={4}
                              className="modern-input w-full px-3 py-2"
                              value={settings.invoice.billingTerms || ''}
                              onChange={(e) =>
                                setSettings((s) => ({
                                  ...s,
                                  invoice: { ...s.invoice, billingTerms: e.target.value }
                                }))
                              }
                            />
                          </label>
                          <label>
                            <span className="mb-1 block text-xs text-slate-400">Template ID</span>
                            <input
                              className="modern-input w-full px-3 py-2"
                              value={settings.invoice.templateId || ''}
                              onChange={(e) =>
                                setSettings((s) => ({
                                  ...s,
                                  invoice: { ...s.invoice, templateId: e.target.value }
                                }))
                              }
                            />
                          </label>
                          <Button type="submit" disabled={saving}>
                            Save invoice settings
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  )}

                  {active === 'theme' && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-white">Theme & layout</CardTitle>
                        <p className="text-xs text-slate-500">
                          Persists to org settings; accent/mode sync to UI context.
                        </p>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={saveTheme} className="grid max-w-xl gap-4">
                          <label>
                            <span className="mb-1 block text-xs text-slate-400">Mode</span>
                            <select
                              className="modern-input w-full px-3 py-2"
                              value={settings.theme.mode}
                              onChange={(e) =>
                                setSettings((s) => ({
                                  ...s,
                                  theme: { ...s.theme, mode: e.target.value }
                                }))
                              }
                            >
                              <option value="dark">Dark</option>
                              <option value="light">Light</option>
                              <option value="system">System</option>
                            </select>
                          </label>
                          <label>
                            <span className="mb-1 block text-xs text-slate-400">Sidebar</span>
                            <select
                              className="modern-input w-full px-3 py-2"
                              value={settings.theme.sidebarStyle}
                              onChange={(e) =>
                                setSettings((s) => ({
                                  ...s,
                                  theme: { ...s.theme, sidebarStyle: e.target.value }
                                }))
                              }
                            >
                              <option value="wide">Wide</option>
                              <option value="compact">Compact</option>
                              <option value="floating">Floating</option>
                            </select>
                          </label>
                          <label>
                            <span className="mb-1 block text-xs text-slate-400">Accent</span>
                            <select
                              className="modern-input w-full px-3 py-2"
                              value={settings.theme.accentColor}
                              onChange={(e) =>
                                setSettings((s) => ({
                                  ...s,
                                  theme: { ...s.theme, accentColor: e.target.value }
                                }))
                              }
                            >
                              <option value="cyan">Cyan</option>
                              <option value="blue">Blue</option>
                              <option value="violet">Violet</option>
                              <option value="emerald">Emerald</option>
                              <option value="amber">Amber</option>
                            </select>
                          </label>
                          <label>
                            <span className="mb-1 block text-xs text-slate-400">Density</span>
                            <select
                              className="modern-input w-full px-3 py-2"
                              value={settings.theme.layoutDensity}
                              onChange={(e) =>
                                setSettings((s) => ({
                                  ...s,
                                  theme: { ...s.theme, layoutDensity: e.target.value }
                                }))
                              }
                            >
                              <option value="comfortable">Comfortable</option>
                              <option value="compact">Compact</option>
                            </select>
                          </label>
                          <Button type="submit" disabled={saving}>
                            Save theme
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  )}

                  {active === 'integrations' && isSuper && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-white">Integrations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={saveIntegrations} className="grid max-w-xl gap-4">
                          <label>
                            <span className="mb-1 block text-xs text-slate-400">Payment provider</span>
                            <input
                              className="modern-input w-full px-3 py-2"
                              value={settings.integrations.paymentGatewayProvider || ''}
                              onChange={(e) =>
                                setSettings((s) => ({
                                  ...s,
                                  integrations: {
                                    ...s.integrations,
                                    paymentGatewayProvider: e.target.value
                                  }
                                }))
                              }
                            />
                          </label>
                          <label>
                            <span className="mb-1 block text-xs text-slate-400">Gateway mode</span>
                            <select
                              className="modern-input w-full px-3 py-2"
                              value={settings.integrations.paymentGatewayMode}
                              onChange={(e) =>
                                setSettings((s) => ({
                                  ...s,
                                  integrations: {
                                    ...s.integrations,
                                    paymentGatewayMode: e.target.value
                                  }
                                }))
                              }
                            >
                              <option value="disabled">Disabled</option>
                              <option value="test">Test</option>
                              <option value="live">Live</option>
                            </select>
                          </label>
                          <label>
                            <span className="mb-1 block text-xs text-slate-400">Email provider label</span>
                            <input
                              className="modern-input w-full px-3 py-2"
                              value={settings.integrations.emailProvider || ''}
                              onChange={(e) =>
                                setSettings((s) => ({
                                  ...s,
                                  integrations: {
                                    ...s.integrations,
                                    emailProvider: e.target.value
                                  }
                                }))
                              }
                            />
                          </label>
                          <label>
                            <span className="mb-1 block text-xs text-slate-400">SMS provider label</span>
                            <input
                              className="modern-input w-full px-3 py-2"
                              value={settings.integrations.smsProvider || ''}
                              onChange={(e) =>
                                setSettings((s) => ({
                                  ...s,
                                  integrations: {
                                    ...s.integrations,
                                    smsProvider: e.target.value
                                  }
                                }))
                              }
                            />
                          </label>
                          <Button type="submit" disabled={saving}>
                            Save integrations
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  )}

                  {active === 'security' && isSuper && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-white">Security policy</CardTitle>
                        <p className="text-xs text-slate-500">
                          JWT expiry here is advisory; enforce via JWT_ISSUE in auth service in production.
                        </p>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={saveSecurity} className="grid max-w-xl gap-4">
                          <label>
                            <span className="mb-1 block text-xs text-slate-400">
                              Session timeout (minutes)
                            </span>
                            <input
                              type="number"
                              className="modern-input w-full px-3 py-2"
                              value={settings.security.jwtSessionTimeoutMinutes}
                              onChange={(e) =>
                                setSettings((s) => ({
                                  ...s,
                                  security: {
                                    ...s.security,
                                    jwtSessionTimeoutMinutes: Number(e.target.value)
                                  }
                                }))
                              }
                            />
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={!!settings.security.twoFactorEnforced}
                              onChange={(e) =>
                                setSettings((s) => ({
                                  ...s,
                                  security: {
                                    ...s.security,
                                    twoFactorEnforced: e.target.checked
                                  }
                                }))
                              }
                            />
                            <span className="text-sm text-slate-300">Enforce 2FA (roadmap)</span>
                          </label>
                          <label>
                            <span className="mb-1 block text-xs text-slate-400">
                              IP allowlist (comma-separated)
                            </span>
                            <input
                              className="modern-input w-full px-3 py-2"
                              value={(settings.security.ipAllowlist || []).join(', ')}
                              onChange={(e) =>
                                setSettings((s) => ({
                                  ...s,
                                  security: {
                                    ...s.security,
                                    ipAllowlist: e.target.value
                                      .split(',')
                                      .map((x) => x.trim())
                                      .filter(Boolean)
                                  }
                                }))
                              }
                            />
                          </label>
                          <Button type="submit" disabled={saving}>
                            Save security
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

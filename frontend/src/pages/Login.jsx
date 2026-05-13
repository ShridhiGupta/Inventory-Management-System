import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Boxes, Package, ShieldCheck, Lock, Mail, ArrowRight } from 'lucide-react';
import api from '../lib/api';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';

function normalizeUser(raw) {
  if (!raw) return null;
  const id = raw.id != null ? String(raw.id) : raw._id != null ? String(raw._id) : '';
  return { ...raw, id };
}

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const apiUrl = useMemo(() => api.defaults?.baseURL || 'http://localhost:5000/api', []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      const token = data.token;
      if (!token || !data.user) {
        setError('Invalid response from server.');
        return;
      }
      localStorage.setItem('token', token);
      onLoginSuccess(normalizeUser(data.user));
    } catch (err) {
      if (!err.response) {
        setError(
          `Cannot reach the server at ${apiUrl}. Start the backend (e.g. npm run dev in the backend folder), ensure MongoDB is running, and that frontend VITE_API_URL matches your API.`
        );
        return;
      }
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        'Unable to sign in. Check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="relative min-h-screen">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_30%_-10%,rgba(6,182,212,0.16),transparent)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_80%_20%,rgba(59,130,246,0.12),transparent)]" />

        <div className="relative mx-auto grid min-h-screen max-w-6xl grid-cols-1 gap-10 px-4 py-10 lg:grid-cols-2 lg:items-center lg:py-0">
          {/* Left marketing panel */}
          <motion.section
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
            className="hidden lg:block"
          >
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20">
                <Package className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold tracking-wide text-slate-300">InventoryPro</p>
                <p className="text-xs text-slate-500">Inventory Management System</p>
              </div>
            </div>

            <h2 className="text-4xl font-bold tracking-tight text-white">
              Manage your inventory,
              <span className="block bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                anywhere.
              </span>
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate-400">
              Track products, warehouses, vendors, stores, and transactions in one secure dashboard.
              Built for speed, accuracy, and control.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4">
              {[
                {
                  Icon: Boxes,
                  title: 'Real-time stock',
                  desc: 'Monitor availability and low-stock alerts.'
                },
                {
                  Icon: BarChart3,
                  title: 'Actionable insights',
                  desc: 'See revenue and transaction trends.'
                },
                {
                  Icon: ShieldCheck,
                  title: 'Role-based access',
                  desc: 'JWT auth and permission-aware APIs.'
                },
                {
                  Icon: Package,
                  title: 'Unified catalog',
                  desc: 'Centralize SKUs and vendor sourcing.'
                }
              ].map(({ Icon, title, desc }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-slate-700/40 bg-slate-900/40 p-4 backdrop-blur-xl"
                >
                  <div className="mb-3 inline-flex rounded-xl bg-white/5 p-2">
                    <Icon className="h-5 w-5 text-cyan-300" />
                  </div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="mt-1 text-xs text-slate-400">{desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 text-xs text-slate-600">
              API: <span className="text-slate-500">{apiUrl}</span>
            </div>
          </motion.section>

          {/* Right auth card */}
          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="flex items-center justify-center"
          >
            <div
              className={cn(
                'w-full max-w-md rounded-3xl border border-slate-700/50 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-xl'
              )}
            >
              <div className="mb-6">
                <p className="text-sm font-semibold text-slate-300">Welcome back</p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">
                  Sign in to your account
                </h1>
                <p className="mt-2 text-sm text-slate-400">
                  Use your email and password to continue.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200"
                  >
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-300">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      id="email"
                      name="email"
                      type="text"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="modern-input w-full pl-10 pr-3 py-2.5"
                      placeholder="you@company.com"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-slate-300"
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      className="text-xs font-medium text-cyan-400 hover:text-cyan-300"
                      onClick={() => setError('Please contact your administrator to reset your password.')}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="modern-input w-full pl-10 pr-3 py-2.5"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  <span className="inline-flex items-center justify-center gap-2">
                    {loading ? 'Signing in…' : 'Sign in'}
                    {!loading && <ArrowRight className="h-4 w-4" />}
                  </span>
                </Button>

                <p className="pt-2 text-center text-xs text-slate-500">
                  By continuing, you agree to your organization’s security policy.
                </p>
              </form>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
};

export default Login;

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Header from '../components/layout/Header';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import api from '../lib/api';
import { getApiErrorMessage, formatCurrency } from '../lib/http';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#64748b'];

const Analytics = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get('/transaction/analytics');
        if (!cancelled) setAnalytics(data.analytics || null);
      } catch (e) {
        if (!cancelled) setError(getApiErrorMessage(e, 'Failed to load analytics.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = analytics?.stats || {};
  const daily = (analytics?.dailyTrends || []).map((d) => ({
    date: d._id,
    revenue: d.revenue ?? 0,
    transactions: d.transactions ?? 0
  }));
  const typeBreakdown = analytics?.typeBreakdown || [];
  const paymentBreakdown = analytics?.paymentBreakdown || [];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Header title="Analytics" user={user} />
      <main className="space-y-6 p-6">
        <p className="text-sm text-slate-400">
          Insights are derived only from stored transactions. Empty charts mean there is no data yet.
        </p>

        {error && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Total revenue', value: formatCurrency(stats.totalRevenue) },
            { label: 'Transactions', value: (stats.totalTransactions ?? 0).toLocaleString() },
            { label: 'Average value', value: formatCurrency(stats.avgTransactionValue) },
            { label: 'Tax recorded', value: formatCurrency(stats.totalTax) }
          ].map((item) => (
            <motion.div key={item.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-slate-500">{item.label}</p>
                  <p className="text-xl font-bold text-white">{item.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-slate-400" />
                <CardTitle className="text-white">Daily revenue</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {daily.length === 0 ? (
                <p className="py-12 text-center text-sm text-slate-400">No daily trend data yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={daily}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: 8
                      }}
                    />
                    <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-white">By transaction type</CardTitle>
            </CardHeader>
            <CardContent>
              {typeBreakdown.length === 0 ? (
                <p className="py-12 text-center text-sm text-slate-400">No type breakdown yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={typeBreakdown}
                      dataKey="revenue"
                      nameKey="_id"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ _id, revenue }) => `${_id}: ${formatCurrency(revenue)}`}
                    >
                      {typeBreakdown.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v) => formatCurrency(v)}
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: 8
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-white">Sales by payment method</CardTitle>
          </CardHeader>
          <CardContent>
            {paymentBreakdown.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">
                No sale payment data yet (requires completed SALE transactions).
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700 text-left text-gray-400">
                      <th className="py-2 pr-4">Method</th>
                      <th className="py-2 pr-4">Revenue</th>
                      <th className="py-2">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentBreakdown.map((row) => (
                      <tr key={row._id || 'unknown'} className="border-b border-gray-800">
                        <td className="py-2 text-white">{row._id || '—'}</td>
                        <td className="py-2 text-slate-300">{formatCurrency(row.revenue)}</td>
                        <td className="py-2 text-slate-300">{row.transactions ?? 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Analytics;

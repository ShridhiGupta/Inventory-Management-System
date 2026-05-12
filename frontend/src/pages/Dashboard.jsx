import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  DollarSign,
  Users,
  ShoppingCart,
  AlertTriangle,
  Store
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Header from '../components/layout/Header';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import api from '../lib/api';
import { getApiErrorMessage, formatCurrency } from '../lib/http';

const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#6b7280'];

const Dashboard = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockCount: 0,
    totalRevenue: 0,
    totalTransactions: 0,
    activeVendors: 0,
    activeStores: 0
  });
  const [revenueSeries, setRevenueSeries] = useState([]);
  const [typeBreakdown, setTypeBreakdown] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const [
          productsRes,
          lowStockRes,
          vendorsRes,
          storesRes,
          txRes,
          analyticsRes,
          recentRes
        ] = await Promise.all([
          api.get('/inventory/products', { params: { page: 1, limit: 1 } }),
          api.get('/inventory/low-stock'),
          api.get('/vendor', { params: { page: 1, limit: 1 } }),
          api.get('/store', { params: { page: 1, limit: 1 } }),
          api.get('/transaction', { params: { page: 1, limit: 1 } }),
          api.get('/transaction/analytics').catch(() => ({ data: { analytics: null } })),
          api.get('/inventory/products', { params: { page: 1, limit: 5 } })
        ]);

        if (cancelled) return;

        const analytics = analyticsRes.data?.analytics;
        const overall = analytics?.stats;

        setStats({
          totalProducts: productsRes.data?.pagination?.total ?? 0,
          lowStockCount: Array.isArray(lowStockRes.data?.items) ? lowStockRes.data.items.length : 0,
          totalRevenue: overall?.totalRevenue ?? 0,
          totalTransactions: overall?.totalTransactions ?? txRes.data?.pagination?.total ?? 0,
          activeVendors: vendorsRes.data?.pagination?.total ?? 0,
          activeStores: storesRes.data?.pagination?.total ?? 0
        });

        const daily = analytics?.dailyTrends || [];
        setRevenueSeries(
          daily.map((d) => ({
            date: d._id,
            revenue: d.revenue ?? 0,
            transactions: d.transactions ?? 0
          }))
        );

        const breakdown = analytics?.typeBreakdown || [];
        setTypeBreakdown(
          breakdown.map((row) => ({
            name: row._id || 'Unknown',
            value: row.transactions ?? 0,
            revenue: row.revenue ?? 0
          }))
        );

        setRecentProducts(recentRes.data?.products || []);
      } catch (e) {
        if (!cancelled) setError(getApiErrorMessage(e, 'Failed to load dashboard.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.25 } }
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <motion.div variants={itemVariants}>
      <Card className="transition-shadow duration-300 hover:shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">{title}</p>
              <p className="mt-1 text-2xl font-bold text-white">{value}</p>
            </div>
            <div className={`rounded-lg p-3 ${color}`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500" />
          <p className="text-gray-400">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Header title="Dashboard" user={user} />

      <main className="p-6">
        {error && (
          <div
            className="mb-6 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
            role="alert"
          >
            {error}
          </div>
        )}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <StatCard
              title="Total products"
              value={stats.totalProducts.toLocaleString()}
              icon={Package}
              color="bg-blue-500/20 text-blue-400"
            />
            <StatCard
              title="Low stock SKUs"
              value={stats.lowStockCount.toLocaleString()}
              icon={AlertTriangle}
              color="bg-red-500/20 text-red-400"
            />
            <StatCard
              title="Recorded revenue"
              value={formatCurrency(stats.totalRevenue)}
              icon={DollarSign}
              color="bg-green-500/20 text-green-400"
            />
            <StatCard
              title="Transactions (period)"
              value={stats.totalTransactions.toLocaleString()}
              icon={ShoppingCart}
              color="bg-purple-500/20 text-purple-400"
            />
            <StatCard
              title="Vendors"
              value={stats.activeVendors.toLocaleString()}
              icon={Users}
              color="bg-orange-500/20 text-orange-400"
            />
            <StatCard
              title="Stores"
              value={stats.activeStores.toLocaleString()}
              icon={Store}
              color="bg-cyan-500/20 text-cyan-400"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-white">Revenue by day</CardTitle>
                </CardHeader>
                <CardContent>
                  {revenueSeries.length === 0 ? (
                    <p className="py-12 text-center text-sm text-slate-400">
                      No transaction history yet. Data will appear once sales are recorded.
                    </p>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={revenueSeries}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                        <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1f2937',
                            border: '1px solid #374151',
                            borderRadius: '8px'
                          }}
                          labelStyle={{ color: '#9ca3af' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={{ fill: '#3b82f6' }}
                          name="Revenue"
                        />
                        <Line
                          type="monotone"
                          dataKey="transactions"
                          stroke="#8b5cf6"
                          strokeWidth={2}
                          dot={{ fill: '#8b5cf6' }}
                          name="Count"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-white">Transactions by type</CardTitle>
                </CardHeader>
                <CardContent>
                  {typeBreakdown.length === 0 ? (
                    <p className="py-12 text-center text-sm text-slate-400">
                      No transaction breakdown yet.
                    </p>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={typeBreakdown}
                          cx="50%"
                          cy="50%"
                          outerRadius={90}
                          dataKey="value"
                          nameKey="name"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {typeBreakdown.map((entry, index) => (
                            <Cell
                              key={`${entry.name}-${index}`}
                              fill={PIE_COLORS[index % PIE_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1f2937',
                            border: '1px solid #374151',
                            borderRadius: '8px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="text-white">Recent products</CardTitle>
              </CardHeader>
              <CardContent>
                {recentProducts.length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-400">
                    No products yet. Add inventory from the Inventory page once your catalog is set up.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="px-4 py-3 text-left font-medium text-gray-400">Name</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-400">SKU</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-400">Category</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-400">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentProducts.map((product) => (
                          <tr
                            key={product._id}
                            className="border-b border-gray-800 transition-colors hover:bg-white/5"
                          >
                            <td className="px-4 py-3 text-white">{product.name}</td>
                            <td className="px-4 py-3 text-gray-300">{product.sku}</td>
                            <td className="px-4 py-3 text-gray-300">{product.category}</td>
                            <td className="px-4 py-3 text-gray-300">
                              {formatCurrency(product.sellingPrice)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;

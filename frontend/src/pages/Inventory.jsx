import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Search, Filter, AlertTriangle, TrendingUp, TrendingDown, Warehouse } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Header from '../components/layout/Header';
import api from '../lib/api';
import { getApiErrorMessage, formatCurrency } from '../lib/http';

const CATEGORIES = [
  { value: '', label: 'All categories' },
  { value: 'ELECTRONICS', label: 'Electronics' },
  { value: 'CLOTHING', label: 'Clothing' },
  { value: 'FOOD', label: 'Food' },
  { value: 'FURNITURE', label: 'Furniture' },
  { value: 'BOOKS', label: 'Books' },
  { value: 'TOYS', label: 'Toys' },
  { value: 'SPORTS', label: 'Sports' },
  { value: 'BEAUTY', label: 'Beauty' },
  { value: 'AUTOMOTIVE', label: 'Automotive' },
  { value: 'OTHER', label: 'Other' }
];

function getTotalStock(inventory) {
  if (!Array.isArray(inventory)) return 0;
  return inventory.reduce((t, inv) => t + (inv.quantity || 0), 0);
}

function getAvailableStock(inventory) {
  if (!Array.isArray(inventory)) return 0;
  return inventory.reduce((t, inv) => t + (inv.availableQuantity ?? inv.quantity ?? 0), 0);
}

function profitMargin(costPrice, sellingPrice) {
  const c = Number(costPrice);
  const s = Number(sellingPrice);
  if (!Number.isFinite(c) || c <= 0 || !Number.isFinite(s)) return null;
  return (((s - c) / c) * 100).toFixed(1);
}

const Inventory = ({ user, pageTitle = 'Inventory' }) => {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page: 1, limit: 100 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (category) params.category = category;
      const { data } = await api.get('/inventory/products', { params });
      setProducts(data.products || []);
      setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
    } catch (e) {
      setError(getApiErrorMessage(e, 'Failed to load products.'));
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, category]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const lowStockOnPage = products.filter((p) => {
    const avail = getAvailableStock(p.inventory);
    return avail < (p.minStockLevel ?? 0);
  }).length;

  const totalInventoryValue = products.reduce((sum, p) => {
    return sum + getTotalStock(p.inventory) * (p.costPrice || 0);
  }, 0);

  const categoryCount = new Set(products.map((p) => p.category).filter(Boolean)).size;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.25 } }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Header title={pageTitle} user={user} />

      <main className="p-6">
        {error && (
          <div className="mb-6 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="mb-6 flex flex-wrap items-center justify-end gap-3">
          <Link
            to="/inventory/locations"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Warehouse className="h-4 w-4" />
            Warehouses &amp; stores
          </Link>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <motion.div variants={itemVariants}>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-400">Products (loaded)</p>
                      <p className="mt-1 text-2xl font-bold text-white">{products.length}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Total in system: {pagination.total?.toLocaleString?.() ?? '—'}
                      </p>
                    </div>
                    <div className="rounded-lg bg-blue-500/20 p-3 text-blue-400">
                      <Package className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-400">Low stock (this page)</p>
                      <p className="mt-1 text-2xl font-bold text-white">{lowStockOnPage}</p>
                    </div>
                    <div className="rounded-lg bg-red-500/20 p-3 text-red-400">
                      <AlertTriangle className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-400">Stock value (this page)</p>
                      <p className="mt-1 text-2xl font-bold text-white">
                        {formatCurrency(totalInventoryValue)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-green-500/20 p-3 text-green-400">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-400">Categories (this page)</p>
                      <p className="mt-1 text-2xl font-bold text-white">{categoryCount}</p>
                    </div>
                    <div className="rounded-lg bg-purple-500/20 p-3 text-purple-400">
                      <Filter className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div variants={itemVariants} className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                placeholder="Search by name, SKU, description…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-white placeholder-gray-400 transition-colors focus:border-blue-500/50 focus:bg-white/10 focus:outline-none"
              />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-blue-500/50 focus:outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value || 'all'} value={c.value} className="bg-slate-900">
                  {c.label}
                </option>
              ))}
            </select>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="text-white">Products</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-16">
                    <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-500" />
                  </div>
                ) : products.length === 0 ? (
                  <p className="py-12 text-center text-sm text-slate-400">
                    No products match your filters. Add products via the API or admin tools once your
                    catalog is configured.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px]">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                            Product
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">SKU</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                            Category
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Stock</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Price</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Margin</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product) => {
                          const avail = getAvailableStock(product.inventory);
                          const low = avail < (product.minStockLevel ?? 0);
                          const margin = profitMargin(product.costPrice, product.sellingPrice);
                          return (
                            <tr
                              key={product._id}
                              className="border-b border-gray-800 hover:bg-white/5"
                            >
                              <td className="px-4 py-3">
                                <p className="font-medium text-white">{product.name}</p>
                                <p className="text-xs text-gray-500">{product.brand || '—'}</p>
                              </td>
                              <td className="px-4 py-3 text-gray-300">{product.sku}</td>
                              <td className="px-4 py-3">
                                <span className="rounded-full bg-blue-500/20 px-2 py-1 text-xs text-blue-400">
                                  {product.category}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <p className="text-white">{getTotalStock(product.inventory)}</p>
                                <p className="text-xs text-gray-500">Available: {avail}</p>
                              </td>
                              <td className="px-4 py-3">
                                <p className="text-white">{formatCurrency(product.sellingPrice)}</p>
                                <p className="text-xs text-gray-500">
                                  Cost: {formatCurrency(product.costPrice)}
                                </p>
                              </td>
                              <td className="px-4 py-3">
                                {margin != null ? (
                                  <div className="flex items-center gap-1">
                                    {Number(margin) >= 0 ? (
                                      <TrendingUp className="h-4 w-4 text-green-400" />
                                    ) : (
                                      <TrendingDown className="h-4 w-4 text-red-400" />
                                    )}
                                    <span className="text-white">{margin}%</span>
                                  </div>
                                ) : (
                                  <span className="text-gray-500">—</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {low ? (
                                  <span className="rounded-full bg-red-500/20 px-2 py-1 text-xs text-red-400">
                                    Low stock
                                  </span>
                                ) : (
                                  <span className="rounded-full bg-green-500/20 px-2 py-1 text-xs text-green-400">
                                    OK
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
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

export default Inventory;

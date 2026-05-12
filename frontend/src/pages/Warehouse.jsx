import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Warehouse as WarehouseIcon, Search, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Header from '../components/layout/Header';
import api from '../lib/api';
import { getApiErrorMessage, formatCurrency } from '../lib/http';

const Warehouse = ({ user, embed = false }) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { limit: 100, page: 1 };
      if (debounced) params.search = debounced;
      const { data } = await api.get('/warehouse', { params });
      setList(data.warehouses || []);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Failed to load warehouses.'));
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [debounced]);

  useEffect(() => {
    load();
  }, [load]);

  const inner = (
    <>
      {!embed && <Header title="Warehouses" user={user} />}
      <main className={embed ? 'space-y-6 p-0' : 'space-y-6 p-6'}>
        {error && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or code…"
            className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:border-blue-500/50 focus:outline-none"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-500" />
          </div>
        ) : list.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-sm text-slate-400">
              No warehouses found. Create warehouses in your system to see them here.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {list.map((w) => {
              const st = w.stats || {};
              const addr = w.address || {};
              const line = [addr.street, addr.city, addr.state, addr.zipCode]
                .filter(Boolean)
                .join(', ');
              return (
                <motion.div
                  key={w._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="h-full">
                    <CardHeader className="flex flex-row items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-lg text-white">{w.name}</CardTitle>
                        <p className="text-sm text-cyan-400">{w.code}</p>
                      </div>
                      <WarehouseIcon className="h-8 w-8 shrink-0 text-slate-500" />
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      {line && (
                        <div className="flex gap-2 text-slate-400">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                          <span>{line}</span>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                        <div className="rounded-lg bg-white/5 px-3 py-2">
                          <p className="text-slate-500">SKUs</p>
                          <p className="text-lg font-semibold text-white">
                            {st.totalProducts ?? 0}
                          </p>
                        </div>
                        <div className="rounded-lg bg-white/5 px-3 py-2">
                          <p className="text-slate-500">Units</p>
                          <p className="text-lg font-semibold text-white">
                            {st.totalQuantity ?? 0}
                          </p>
                        </div>
                        <div className="rounded-lg bg-white/5 px-3 py-2">
                          <p className="text-slate-500">Stock value</p>
                          <p className="text-lg font-semibold text-white">
                            {formatCurrency(st.totalValue ?? 0)}
                          </p>
                        </div>
                        <div className="rounded-lg bg-white/5 px-3 py-2">
                          <p className="text-slate-500">Low stock lines</p>
                          <p className="text-lg font-semibold text-white">
                            {st.lowStockItems ?? 0}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500">
                        {w.isActive ? 'Active' : 'Inactive'}
                        {w.manager
                          ? ` · Manager: ${w.manager.firstName || ''} ${w.manager.lastName || ''}`
                          : ''}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );

  if (embed) {
    return <div className="space-y-6">{inner}</div>;
  }
  return <div className="min-h-screen bg-slate-950">{inner}</div>;
};

export default Warehouse;

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Store, Search, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Header from '../components/layout/Header';
import api from '../lib/api';
import { getApiErrorMessage, formatCurrency } from '../lib/http';

const Stores = ({ user, embed = false }) => {
  const [stores, setStores] = useState([]);
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
      const { data } = await api.get('/store', { params });
      setStores(data.stores || []);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Failed to load stores.'));
      setStores([]);
    } finally {
      setLoading(false);
    }
  }, [debounced]);

  useEffect(() => {
    load();
  }, [load]);

  const inner = (
    <>
      {!embed && <Header title="Stores" user={user} />}
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
            placeholder="Search stores…"
            className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:border-blue-500/50 focus:outline-none"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-500" />
          </div>
        ) : stores.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-sm text-slate-400">
              No stores configured. Add store locations to track retail points and stock.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {stores.map((s) => {
              const st = s.stats || {};
              const a = s.address || {};
              const line = [a.street, a.city, a.state].filter(Boolean).join(', ');
              const wh = s.warehouseId;
              return (
                <motion.div
                  key={s._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <CardTitle className="text-lg text-white">{s.name}</CardTitle>
                          <p className="text-sm text-cyan-400">{s.code}</p>
                        </div>
                        <Store className="h-7 w-7 shrink-0 text-slate-500" />
                      </div>
                      {s.type && (
                        <p className="text-xs uppercase tracking-wide text-slate-500">{s.type}</p>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      {line && (
                        <div className="flex gap-2 text-slate-400">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                          {line}
                        </div>
                      )}
                      {wh && (
                        <p className="text-xs text-slate-500">
                          Warehouse: {wh.name} {wh.code ? `(${wh.code})` : ''}
                        </p>
                      )}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-lg bg-white/5 px-3 py-2">
                          <p className="text-slate-500">SKUs</p>
                          <p className="text-lg font-semibold text-white">{st.totalProducts ?? 0}</p>
                        </div>
                        <div className="rounded-lg bg-white/5 px-3 py-2">
                          <p className="text-slate-500">Low stock</p>
                          <p className="text-lg font-semibold text-white">{st.lowStockItems ?? 0}</p>
                        </div>
                        <div className="rounded-lg bg-white/5 px-3 py-2">
                          <p className="text-slate-500">Sales total</p>
                          <p className="text-lg font-semibold text-white">
                            {formatCurrency(st.totalSales ?? 0)}
                          </p>
                        </div>
                        <div className="rounded-lg bg-white/5 px-3 py-2">
                          <p className="text-slate-500">Sale txns</p>
                          <p className="text-lg font-semibold text-white">
                            {st.totalTransactions ?? 0}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500">{s.isActive ? 'Active' : 'Inactive'}</p>
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

export default Stores;

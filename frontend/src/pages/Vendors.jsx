import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Mail, Phone, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Header from '../components/layout/Header';
import api from '../lib/api';
import { getApiErrorMessage, formatCurrency } from '../lib/http';

const Vendors = ({ user, pageTitle = 'Vendors' }) => {
  const [vendors, setVendors] = useState([]);
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
      const { data } = await api.get('/vendor', { params });
      setVendors(data.vendors || []);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Failed to load vendors.'));
      setVendors([]);
    } finally {
      setLoading(false);
    }
  }, [debounced]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="min-h-screen bg-slate-950">
      <Header title={pageTitle} user={user} />
      <main className="space-y-6 p-6">
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
            placeholder="Search vendors…"
            className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:border-blue-500/50 focus:outline-none"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-500" />
          </div>
        ) : vendors.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-sm text-slate-400">
              No vendors yet. Add vendor records in your system to manage suppliers here.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {vendors.map((v) => {
              const st = v.stats || {};
              const a = v.address || {};
              const addr = [a.street, a.city, a.state].filter(Boolean).join(', ');
              return (
                <motion.div
                  key={v._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg text-white">{v.name}</CardTitle>
                        <Users className="h-7 w-7 shrink-0 text-slate-500" />
                      </div>
                      {v.contactPerson && (
                        <p className="text-sm text-slate-400">{v.contactPerson}</p>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      {v.email && (
                        <div className="flex items-center gap-2 text-slate-300">
                          <Mail className="h-4 w-4 text-slate-500" />
                          {v.email}
                        </div>
                      )}
                      {v.phone && (
                        <div className="flex items-center gap-2 text-slate-300">
                          <Phone className="h-4 w-4 text-slate-500" />
                          {v.phone}
                        </div>
                      )}
                      {addr && (
                        <div className="flex items-start gap-2 text-slate-400">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                          {addr}
                        </div>
                      )}
                      <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-3 text-xs">
                        <div>
                          <p className="text-slate-500">Products</p>
                          <p className="font-semibold text-white">{st.productCount ?? 0}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Purchases</p>
                          <p className="font-semibold text-white">{st.totalTransactions ?? 0}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Volume</p>
                          <p className="font-semibold text-white">
                            {formatCurrency(st.totalAmount ?? 0)}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500">
                        {v.isActive ? 'Active' : 'Inactive'}
                        {v.rating != null ? ` · Rating ${v.rating}` : ''}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Vendors;

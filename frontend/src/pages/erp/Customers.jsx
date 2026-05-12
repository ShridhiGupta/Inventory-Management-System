import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Users, Search } from 'lucide-react';
import Header from '../../components/layout/Header';
import { Card, CardContent } from '../../components/ui/Card';
import api from '../../lib/api';
import { getApiErrorMessage } from '../../lib/http';

export default function Customers({ user }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { limit: 50, page: 1 };
      if (q.trim()) params.search = q.trim();
      const { data } = await api.get('/customer', { params });
      setRows(data.customers || []);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Could not load customers.'));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [q]);

  useEffect(() => {
    const t = setTimeout(load, 350);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div className="min-h-screen bg-slate-950">
      <Header title="Customers" user={user} />
      <main className="space-y-6 p-6">
        {error && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search customers…"
            className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:border-blue-500/50 focus:outline-none"
          />
        </div>
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-500" />
          </div>
        ) : rows.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-sm text-slate-400">
              No customers found. Extend CRUD as your sales flow matures.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {rows.map((c) => (
              <motion.div key={c._id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-white">
                          {c.firstName} {c.lastName}
                        </p>
                        <p className="text-xs text-slate-500">{c.email}</p>
                      </div>
                      <Users className="h-5 w-5 text-slate-600" />
                    </div>
                    <p className="mt-2 text-sm text-slate-400">{c.phone}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

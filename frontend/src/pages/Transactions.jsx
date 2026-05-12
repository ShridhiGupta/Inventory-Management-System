import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Header from '../components/layout/Header';
import api from '../lib/api';
import { getApiErrorMessage, formatCurrency } from '../lib/http';

function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return '—';
  }
}

const TX_TYPES = ['', 'SALE', 'PURCHASE', 'TRANSFER', 'RETURN', 'ADJUSTMENT', 'DAMAGE'];

const Transactions = ({ user, embed = false }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');

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
      if (type) params.type = type;
      if (status) params.status = status;
      const { data } = await api.get('/transaction', { params });
      setRows(data.transactions || []);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Failed to load transactions.'));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [debounced, type, status]);

  useEffect(() => {
    load();
  }, [load]);

  const inner = (
    <>
      {!embed && <Header title="Transactions" user={user} />}
      <main className={embed ? 'space-y-6 p-0' : 'space-y-6 p-6'}>
        {error && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap">
          <div className="relative min-w-[240px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search # or reference…"
              className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:border-blue-500/50 focus:outline-none"
            />
          </div>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:outline-none"
          >
            {TX_TYPES.map((t) => (
              <option key={t || 'all'} value={t} className="bg-slate-900">
                {t ? t : 'All types'}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:outline-none"
          >
            <option value="" className="bg-slate-900">
              All statuses
            </option>
            <option value="PENDING" className="bg-slate-900">
              Pending
            </option>
            <option value="COMPLETED" className="bg-slate-900">
              Completed
            </option>
            <option value="CANCELLED" className="bg-slate-900">
              Cancelled
            </option>
            <option value="PARTIAL" className="bg-slate-900">
              Partial
            </option>
          </select>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-slate-400" />
                <CardTitle className="text-white">All transactions</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-16">
                  <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-500" />
                </div>
              ) : rows.length === 0 ? (
                <p className="py-12 text-center text-sm text-slate-400">
                  No transactions for the current filters.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1000px] text-sm">
                    <thead>
                      <tr className="border-b border-gray-700 text-left text-gray-400">
                        <th className="px-3 py-2">Number</th>
                        <th className="px-3 py-2">Date</th>
                        <th className="px-3 py-2">Type</th>
                        <th className="px-3 py-2">From</th>
                        <th className="px-3 py-2">To</th>
                        <th className="px-3 py-2">Amount</th>
                        <th className="px-3 py-2">Txn status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((t) => (
                        <tr key={t._id} className="border-b border-gray-800 hover:bg-white/5">
                          <td className="px-3 py-2 font-mono text-white">{t.transactionNumber}</td>
                          <td className="px-3 py-2 text-slate-400">{formatDate(t.transactionDate)}</td>
                          <td className="px-3 py-2 text-slate-300">{t.type}</td>
                          <td className="px-3 py-2 text-slate-300">
                            {t.fromLocationId?.name || t.fromLocationId?.code || '—'}
                          </td>
                          <td className="px-3 py-2 text-slate-300">
                            {t.toLocationId?.name || t.toLocationId?.code || '—'}
                          </td>
                          <td className="px-3 py-2 text-white">{formatCurrency(t.finalAmount)}</td>
                          <td className="px-3 py-2 text-slate-300">{t.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </>
  );

  if (embed) return <div className="space-y-6">{inner}</div>;
  return <div className="min-h-screen bg-slate-950">{inner}</div>;
};

export default Transactions;

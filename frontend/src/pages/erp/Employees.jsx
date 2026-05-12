import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { UserCircle, Search } from 'lucide-react';
import Header from '../../components/layout/Header';
import { Card, CardContent } from '../../components/ui/Card';
import api from '../../lib/api';
import { getApiErrorMessage } from '../../lib/http';

export default function Employees({ user }) {
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
      const { data } = await api.get('/employee', { params });
      setRows(data.employees || []);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Could not load employees.'));
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
      <Header title="Employees" user={user} />
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
            placeholder="Search employees…"
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
              No employees returned. Check permissions or seed data.
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-slate-500">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Role</th>
                  <th className="py-2">Department</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((e) => (
                  <motion.tr
                    key={e._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-white/5"
                  >
                    <td className="py-2 pr-4 text-white">
                      <span className="inline-flex items-center gap-2">
                        <UserCircle className="h-4 w-4 text-slate-500" />
                        {e.firstName} {e.lastName}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-slate-400">{e.email}</td>
                    <td className="py-2 pr-4 text-slate-300">{e.role}</td>
                    <td className="py-2 text-slate-400">{e.department || '—'}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

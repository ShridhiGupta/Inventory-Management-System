import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  CalendarClock,
  ClipboardList,
  FileSpreadsheet,
  Pin,
  Search,
  Star,
  Table2
} from 'lucide-react';
import Header from '../../components/layout/Header';
import { Card, CardContent } from '../../components/ui/Card';
import api from '../../lib/api';
import { formatCurrency, getApiErrorMessage } from '../../lib/http';
import { cn } from '../../lib/utils';

const fallbackGroups = [
  { name: 'Orders', reports: ['List Of Orders', 'Order Details', 'Order Wise Payment Breakup'] },
  { name: 'Sales', reports: ['Daily Sales', 'Location Wise Sales', 'Product Wise Sales'] },
  { name: 'Inventory', reports: ['Stock Level', 'Low Stock Products', 'Stock Movement'] }
];

function displayPinnedValue(item) {
  if (item.currency) return formatCurrency(item.value, item.currency);
  return `${item.value ?? 0}${item.suffix ? ` ${item.suffix}` : ''}`;
}

function groupIcon(name) {
  if (name.includes('Inventory')) return Table2;
  if (name.includes('Sales')) return BarChart3;
  if (name.includes('Accounting')) return FileSpreadsheet;
  return ClipboardList;
}

export default function Reports({ user }) {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeGroup, setActiveGroup] = useState('Reports home');

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/reports/dashboard');
      setDashboard(data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load reports dashboard.'));
      setDashboard({ groups: fallbackGroups, pinned: [], totals: { reports: 0, pinned: 0 } });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const groups = dashboard?.groups || fallbackGroups;
  const pinned = dashboard?.pinned || [];
  const totalReports = dashboard?.totals?.reports || groups.reduce((sum, group) => sum + group.reports.length, 0);

  const leftNav = useMemo(() => {
    return ['Reports home', 'Pinned', ...groups.map((group) => group.name)];
  }, [groups]);

  const filteredGroups = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return groups;
    return groups
      .map((group) => ({
        ...group,
        reports: group.reports.filter((report) => report.toLowerCase().includes(term) || group.name.toLowerCase().includes(term))
      }))
      .filter((group) => group.reports.length > 0);
  }, [groups, search]);

  const visibleGroups = activeGroup === 'Reports home' || activeGroup === 'Pinned'
    ? filteredGroups
    : filteredGroups.filter((group) => group.name === activeGroup);

  return (
    <div className="min-h-screen bg-slate-950">
      <Header title="Reports" user={user} />
      <div className="flex min-h-[calc(100vh-4rem)]">
        <aside className="hidden w-72 shrink-0 overflow-y-auto border-r border-white/10 bg-slate-900/50 p-4 lg:block">
          <div className="mb-5">
            <p className="text-xs uppercase tracking-wide text-slate-500">Management portal</p>
            <h2 className="mt-1 text-lg font-semibold text-white">QueueBuster</h2>
          </div>
          <nav className="space-y-1">
            {leftNav.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setActiveGroup(item)}
                className={cn(
                  'flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                  activeGroup === item
                    ? 'bg-blue-500/20 text-blue-300'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                )}
              >
                <span className="truncate">{item}</span>
                {item !== 'Reports home' && item !== 'Pinned' && (
                  <span className="text-xs text-slate-500">{groups.find((group) => group.name === item)?.reports.length || 0}</span>
                )}
              </button>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 space-y-6 p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-white">Account</h1>
                <span className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-300">Super Chain Admin</span>
              </div>
              <h2 className="mt-3 text-2xl font-bold text-white">Reports</h2>
              <p className="mt-1 max-w-3xl text-sm text-slate-400">
                Every report across QueueBuster, in one place. Pin the ones you check daily — they'll stay at the top and on your sidebar.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
                <CalendarClock className="h-4 w-4" />
                Schedule reports
              </button>
              <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                <FileSpreadsheet className="h-4 w-4" />
                Open in Excel
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <Card className="border-white/10">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={`Search ${totalReports}+ reports — try "tax", "void", "stock movement"...`}
                  className="modern-input w-full py-3 pl-10 pr-14"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-white/10 px-2 py-1 text-xs text-slate-500">
                  ⌘K
                </span>
              </div>
            </CardContent>
          </Card>

          <section className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
              <Pin className="h-4 w-4 text-blue-300" />
              Pinned · live
              <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs text-blue-200">{pinned.length || 4}</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {(loading && pinned.length === 0 ? Array.from({ length: 4 }) : pinned).map((item, index) => (
                <Card key={item?.id || index} className="border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-white">{item?.title || 'Loading report'}</p>
                        <p className="mt-1 text-xs text-slate-500">{item?.period || 'Today'}</p>
                      </div>
                      <Star className="h-4 w-4 text-blue-300" />
                    </div>
                    <p className="mt-5 text-2xl font-bold text-white">{item ? displayPinnedValue(item) : '-'}</p>
                    <p className="mt-2 text-xs text-emerald-300">{item?.trend || 'watch'}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            {visibleGroups.map((group) => {
              const Icon = groupIcon(group.name);
              return (
                <Card key={group.name} className="border-white/10">
                  <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-white/5 p-2 text-slate-300">
                        <Icon className="h-4 w-4" />
                      </div>
                      <h3 className="font-semibold text-white">{group.name}</h3>
                    </div>
                    <span className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-400">{group.reports.length}</span>
                  </div>
                  <CardContent className="grid gap-x-6 gap-y-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
                    {group.reports.map((report) => (
                      <button
                        key={report}
                        type="button"
                        className="rounded-lg border border-transparent px-3 py-2 text-left text-sm text-slate-300 transition-colors hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-white"
                      >
                        {report}
                      </button>
                    ))}
                  </CardContent>
                </Card>
              );
            })}

            {!loading && visibleGroups.length === 0 && (
              <Card className="border-white/10">
                <CardContent className="py-16 text-center text-sm text-slate-400">
                  No reports matched your search.
                </CardContent>
              </Card>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

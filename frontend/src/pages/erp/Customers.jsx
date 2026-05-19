import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BadgeIndianRupee,
  BarChart3,
  ClipboardList,
  CreditCard,
  FileClock,
  History,
  Mail,
  MessageCircle,
  Search,
  Settings2,
  Sparkles,
  Star,
  Tags,
  UserRoundX,
  Users,
  WalletCards
} from 'lucide-react';
import Header from '../../components/layout/Header';
import { Card, CardContent } from '../../components/ui/Card';
import api from '../../lib/api';
import { getApiErrorMessage } from '../../lib/http';
import { cn } from '../../lib/utils';

const customerMenu = [
  { id: 'dashboard', label: 'Customers Dashboard', icon: BarChart3 },
  { id: 'list', label: 'List Of Customers', icon: Users },
  { id: 'groups', label: 'Customer Groups', icon: Tags },
  { id: 'inactive', label: 'Inactive Customers', icon: UserRoundX },
  { id: 'ledger', label: 'Customer Ledger', icon: ClipboardList },
  { id: 'credit-sale', label: 'Customer Credit Sale', icon: CreditCard },
  { id: 'settlement', label: 'Credit Settlement', icon: WalletCards },
  { id: 'credit-note', label: 'Credit Note History', icon: History },
  { id: 'sales-report', label: 'Customers Sales Report', icon: BarChart3 },
  { id: 'credit-configs', label: 'Credit Advanced Configs list', icon: Settings2 },
  { id: 'credit-approval', label: 'Credit Advanced Configuration Approval', icon: FileClock },
  { id: 'unsettled', label: 'Unsettled Orders', icon: ClipboardList },
  { id: 'advance-payment', label: 'Customer Advance Payment', icon: BadgeIndianRupee },
  { id: 'balance-transfer', label: 'Balance Transfer Tracker', icon: ArrowRight },
  { id: 'loyalty', label: 'Loyalty Settings', icon: Star },
  { id: 'message-history', label: 'Message History', icon: Mail },
  { id: 'whatsapp-logs', label: 'WhatsApp Logs', icon: MessageCircle },
  { id: 'sms-credit', label: 'SMS Credit', icon: Mail },
  { id: 'whatsapp-credit', label: 'WhatsApp Credit', icon: MessageCircle }
];

const kpis = [
  { label: 'In view', value: '-', hint: 'Open list to load' },
  { label: 'Active 30d', value: '-', hint: 'Open list to load' },
  { label: 'Churning', value: '-', hint: 'Open list to load' },
  { label: 'Avg LTV', value: '-', hint: 'Open list to load' }
];

const insightCards = [
  {
    label: 'Segment insights',
    title: 'Auto-build VIP, Lapsing, New and At-risk segments from order history.',
    action: 'Open segments'
  },
  {
    label: 'Winback drafts',
    title: 'Drafted SMS and WhatsApp copy for customers slipping out of active.',
    action: 'Loyalty'
  },
  {
    label: 'Loyalty leakage',
    title: "Members who earned points but haven't redeemed in 90 days.",
    action: 'Memberships'
  }
];

const dashboardTiles = [
  { title: 'Customer list', body: 'Search, segment, export.', target: 'list' },
  { title: 'Customer dashboard', body: 'Visit history and loyalty summary.', target: 'dashboard' },
  { title: 'Bulk add / edit', body: 'Import customers in one pass.', target: 'list' },
  { title: 'Loyalty settings', body: 'Earn and burn rules.', target: 'loyalty' },
  { title: 'Memberships', body: 'Tiers, points, redemptions.', target: 'groups' },
  { title: 'Gift vouchers', body: 'Issue, track, redeem.', target: 'credit-note' },
  { title: 'Inactive report', body: 'Surface churning customers.', target: 'inactive' },
  { title: 'Customer sales', body: 'Revenue by customer with filters.', target: 'sales-report' }
];

function customerName(customer) {
  return [customer.firstName, customer.lastName].filter(Boolean).join(' ') || customer.name || 'Unnamed customer';
}

function initials(customer) {
  return customerName(customer)
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'C';
}

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}

function PlaceholderSection({ title }) {
  return (
    <Card className="border-white/10">
      <CardContent className="flex min-h-[420px] flex-col items-center justify-center p-8 text-center">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <ClipboardList className="h-10 w-10 text-slate-500" />
        </div>
        <h3 className="mt-5 text-lg font-semibold text-white">{title}</h3>
        <p className="mt-2 max-w-md text-sm text-slate-400">
          This QueueBuster customer module is ready in navigation. Connect its API workflow when the backend endpoint is available.
        </p>
      </CardContent>
    </Card>
  );
}

export default function Customers({ user }) {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const loadCustomers = useCallback(async () => {
    if (activeSection !== 'list' && activeSection !== 'inactive') return;

    setLoading(true);
    setError('');
    try {
      const params = { limit: 100, page: 1 };
      if (debounced) params.search = debounced;
      const { data } = await api.get('/customer', { params });
      let nextRows = data.customers || [];
      if (activeSection === 'inactive') {
        nextRows = nextRows.filter((customer) => customer.isActive === false);
      }
      setRows(nextRows);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load customers.'));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [activeSection, debounced]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const activeMenuItem = useMemo(
    () => customerMenu.find((item) => item.id === activeSection) || customerMenu[0],
    [activeSection]
  );

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {kpis.map((item) => (
          <Card key={item.label} className="border-white/10">
            <CardContent className="p-4">
              <p className="text-sm font-medium text-slate-400">{item.label}</p>
              <p className="mt-3 text-3xl font-bold text-white">{item.value}</p>
              <p className="mt-2 text-xs text-slate-500">{item.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-white/10">
        <CardContent className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-300" />
            <div>
              <h3 className="font-semibold text-white">AI insights</h3>
              <p className="text-xs text-slate-500">Customer intelligence and action prompts.</p>
            </div>
          </div>
          <div className="grid gap-3 lg:grid-cols-3">
            {insightCards.map((item) => (
              <div key={item.label} className="rounded-lg border border-white/10 bg-slate-950/40 p-4">
                <p className="text-sm font-semibold text-slate-300">{item.label}</p>
                <p className="mt-2 min-h-12 text-sm text-slate-400">{item.title}</p>
                <button className="mt-4 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10">
                  {item.action}
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardTiles.map((tile) => (
          <button
            key={tile.title}
            type="button"
            onClick={() => setActiveSection(tile.target)}
            className="rounded-xl border border-white/10 bg-slate-900 p-4 text-left transition-colors hover:border-blue-500/40 hover:bg-slate-800"
          >
            <p className="font-semibold text-white">{tile.title}</p>
            <p className="mt-2 text-sm text-slate-400">{tile.body}</p>
          </button>
        ))}
      </div>
    </div>
  );

  const renderCustomerList = () => (
    <Card className="border-white/10">
      <div className="flex flex-col gap-3 border-b border-white/10 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="font-semibold text-white">{activeSection === 'inactive' ? 'Inactive Customers' : 'Customer list'}</h3>
          <p className="text-xs text-slate-500">Search, segment, export.</p>
        </div>
        <div className="relative min-w-[260px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search customers"
            className="modern-input w-full py-2 pl-9 pr-3"
          />
        </div>
      </div>
      <CardContent className="p-0">
        {error && (
          <div className="m-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-500" />
          </div>
        ) : rows.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-400">No matching customer found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-slate-900/70 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((customer) => (
                  <tr key={customer._id} className="border-b border-white/5 text-slate-300 hover:bg-white/5">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/15 text-sm font-semibold text-blue-200">
                          {initials(customer)}
                        </div>
                        <div>
                          <p className="font-medium text-white">{customerName(customer)}</p>
                          <p className="text-xs text-slate-500">{customer._id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">{customer.phone || '-'}</td>
                    <td className="px-4 py-4">{customer.email || '-'}</td>
                    <td className="px-4 py-4">{formatDate(customer.createdAt)}</td>
                    <td className="px-4 py-4">
                      <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-1 text-xs text-blue-300">
                        {customer.isActive === false ? 'Inactive' : 'Active'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-slate-950">
      <Header title="Customers" user={user} />
      <div className="flex min-h-[calc(100vh-4rem)]">
        <aside className="hidden w-80 shrink-0 overflow-y-auto border-r border-white/10 bg-slate-900/50 p-4 lg:block">
          <div className="mb-5">
            <p className="text-xs uppercase tracking-wide text-slate-500">QueueBuster</p>
            <h2 className="mt-1 text-lg font-semibold text-white">Customers</h2>
          </div>
          <nav className="space-y-1">
            {customerMenu.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                  activeSection === item.id
                    ? 'bg-blue-500/20 text-blue-300'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="min-w-0 truncate">{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 space-y-6 p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-white">Test_BZ</h1>
                <span className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-300">Super Chain Admin</span>
              </div>
              <h2 className="mt-3 text-2xl font-bold text-white">Customers</h2>
              <p className="mt-1 text-sm text-slate-400">Everyone who walked in, ordered online, or redeemed a membership.</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
              {activeMenuItem.label}
            </div>
          </div>

          {activeSection === 'dashboard'
            ? renderDashboard()
            : activeSection === 'list' || activeSection === 'inactive'
              ? renderCustomerList()
              : <PlaceholderSection title={activeMenuItem.label} />}
        </main>
      </div>
    </div>
  );
}

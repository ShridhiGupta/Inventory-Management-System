import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  ChevronDown,
  ClipboardList,
  FileCheck2,
  FileClock,
  FileX2,
  ListChecks,
  Search,
  Send,
  Store,
  Wand2
} from 'lucide-react';
import Header from '../../components/layout/Header';
import { Card, CardContent } from '../../components/ui/Card';
import api from '../../lib/api';
import { cn } from '../../lib/utils';
import { formatCurrency, getApiErrorMessage } from '../../lib/http';

const salesOrderMenu = [
  { id: 'invoice', label: 'Invoice Sales Order', icon: FileCheck2 },
  { id: 'uninvoiced', label: 'Uninvoiced Sales Order', icon: FileClock },
  { id: 'conversion', label: 'Invoice Conversion Tracker', icon: ListChecks },
  { id: 'writeoff', label: 'Write Off', icon: FileX2 },
  { id: 'quotation', label: 'Quotation Pending Approval', icon: Send },
  { id: 'auto-invoice', label: 'Auto Invoice', icon: Wand2 }
];

function toInputDate(date) {
  return date.toISOString().slice(0, 10);
}

function formatDisplayDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function formatDateRange(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return `${start.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })} - ${end.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}`;
}

function getPartyFromNotes(notes) {
  const match = notes?.match(/Customer:\s*([^|]+)/i);
  return match?.[1]?.trim() || '-';
}

function mapSalesOrder(row, index) {
  const grossBill = Number(row.totalAmount || row.finalAmount || 0);
  const discount = Number(row.discountAmount || 0);
  const additionalCharge = Math.max(Number(row.finalAmount || 0) - Number(row.totalAmount || 0), 0);
  const store = row.fromLocationId;

  return {
    id: row._id,
    serial: index + 1,
    salesOrderId: row.transactionNumber || '-',
    bookingId: row.referenceNumber || row.transactionNumber || '-',
    bookingDate: row.transactionDate,
    billingUsername: [row.createdBy?.firstName, row.createdBy?.lastName].filter(Boolean).join(' ') || row.createdBy?.email || '-',
    grossBill,
    discount,
    additionalCharge,
    status: row.status || '-',
    channelId: row.paymentMethod || '-',
    channel: row.type === 'SALE' ? 'POS' : row.type || '-',
    partyId: row.toLocationId?._id || '-',
    party: getPartyFromNotes(row.notes)
  };
}

export default function SalesOrders({ user }) {
  const today = useMemo(() => new Date(), []);
  const [activeView, setActiveView] = useState('invoice');
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [startDate, setStartDate] = useState(toInputDate(today));
  const [endDate, setEndDate] = useState(toInputDate(today));
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    api.get('/store', { params: { limit: 100, page: 1 } })
      .then(({ data }) => {
        if (!cancelled) setStores(data.stores || []);
      })
      .catch(() => {
        if (!cancelled) setStores([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const loadSalesOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        type: 'SALE',
        page: 1,
        limit: 100,
        startDate,
        endDate: `${endDate}T23:59:59.999Z`
      };
      if (debounced) params.search = debounced;
      const { data } = await api.get('/transaction', { params });
      let nextRows = (data.transactions || []).map(mapSalesOrder);
      if (selectedStore) {
        nextRows = nextRows.filter((_, index) => {
          const source = data.transactions[index]?.fromLocationId;
          return source?._id === selectedStore || source === selectedStore;
        });
      }
      setRows(nextRows);
    } catch (err) {
      setRows([]);
      setError(getApiErrorMessage(err, 'Failed to load sales orders.'));
    } finally {
      setLoading(false);
    }
  }, [debounced, endDate, selectedStore, startDate]);

  useEffect(() => {
    loadSalesOrders();
  }, [loadSalesOrders]);

  const filteredRows = useMemo(() => {
    switch (activeView) {
      case 'uninvoiced':
        return rows.filter((row) => row.status !== 'COMPLETED');
      case 'writeoff':
        return rows.filter((row) => row.status === 'CANCELLED');
      default:
        return rows;
    }
  }, [activeView, rows]);

  const totalResults = filteredRows.length;
  const regionCount = stores.length > 0 ? 1 : 0;
  const storeCount = stores.length || (selectedStore ? 1 : 0);

  return (
    <div className="min-h-screen bg-slate-950">
      <Header title="Sales Order" user={user} />
      <div className="flex min-h-[calc(100vh-4rem)]">
        <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-slate-900/50 p-4 lg:block">
          <div className="mb-5">
            <p className="text-xs uppercase tracking-wide text-slate-500">QueueBuster</p>
            <h2 className="mt-1 text-lg font-semibold text-white">Sales Order</h2>
          </div>
          <nav className="space-y-1">
            {salesOrderMenu.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveView(item.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                  activeView === item.id
                    ? 'bg-blue-500/20 text-blue-300'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
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
              <h2 className="mt-3 text-2xl font-bold text-white">Sales Order</h2>
              <p className="mt-1 text-sm text-slate-400">Create, invoice, filter, and track sales orders across stores.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="rounded-lg border border-white/10 bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
                Bulk Sales Order
              </button>
              <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                Bulk Operations
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <div className="grid gap-4 xl:grid-cols-[minmax(220px,1fr)_260px_260px]">
            <Card className="border-white/10">
              <CardContent className="p-4">
                <label className="text-xs font-medium uppercase tracking-wide text-slate-500">Search this table</label>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search"
                    className="modern-input w-full py-2 pl-9 pr-3"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/10">
              <CardContent className="p-4">
                <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                  <CalendarDays className="h-4 w-4" />
                  Date Range
                </label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="modern-input w-full text-sm" />
                  <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} className="modern-input w-full text-sm" />
                </div>
                <p className="mt-2 text-xs text-slate-500">{formatDateRange(startDate, endDate)}</p>
              </CardContent>
            </Card>

            <Card className="border-white/10">
              <CardContent className="p-4">
                <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                  <Store className="h-4 w-4" />
                  Regions & Stores
                </label>
                <div className="relative mt-2">
                  <select value={selectedStore} onChange={(event) => setSelectedStore(event.target.value)} className="modern-input w-full appearance-none pr-9">
                    <option value="">All stores</option>
                    {stores.map((store) => (
                      <option key={store._id} value={store._id}>{store.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                </div>
                <p className="mt-2 text-xs text-slate-500">{regionCount} Regions & {storeCount} Stores</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-white/10">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-slate-400" />
                <div>
                  <h3 className="font-semibold text-white">List of Bulk Sales Order</h3>
                  <p className="text-xs text-slate-500">Invoice Sales Order</p>
                </div>
              </div>
              <button className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10">
                Bulk Operations
              </button>
            </div>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1800px] text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-slate-900/70 text-left text-xs uppercase tracking-wide text-slate-500">
                      {[
                        '',
                        'ID',
                        'Sales Order ID',
                        'Booking ID',
                        'Booking Date',
                        'Billing Username',
                        'Gross Bill',
                        'Total Discount',
                        'Additional Charge Value',
                        'TDS Rate',
                        'TDS Value',
                        'TCS Rate',
                        'TCS Value',
                        'Status',
                        'Channel ID',
                        'Channel',
                        'Party ID',
                        'Party'
                      ].map((heading) => (
                        <th key={heading || 'select'} className="whitespace-nowrap px-3 py-3 font-medium">
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={18} className="px-3 py-16 text-center text-slate-400">
                          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-b-2 border-blue-500" />
                        </td>
                      </tr>
                    ) : filteredRows.length === 0 ? (
                      <tr>
                        <td colSpan={18} className="px-3 py-16 text-center text-sm text-slate-400">
                          No matching record found
                        </td>
                      </tr>
                    ) : (
                      filteredRows.map((row) => (
                        <tr key={row.id} className="border-b border-white/5 text-slate-300 hover:bg-white/5">
                          <td className="px-3 py-3"><input type="checkbox" className="rounded border-white/10 bg-white/5" /></td>
                          <td className="whitespace-nowrap px-3 py-3 text-white">{row.serial}</td>
                          <td className="whitespace-nowrap px-3 py-3 font-mono text-blue-300">{row.salesOrderId}</td>
                          <td className="whitespace-nowrap px-3 py-3">{row.bookingId}</td>
                          <td className="whitespace-nowrap px-3 py-3">{formatDisplayDate(row.bookingDate)}</td>
                          <td className="whitespace-nowrap px-3 py-3">{row.billingUsername}</td>
                          <td className="whitespace-nowrap px-3 py-3 text-white">{formatCurrency(row.grossBill, 'INR')}</td>
                          <td className="whitespace-nowrap px-3 py-3">{formatCurrency(row.discount, 'INR')}</td>
                          <td className="whitespace-nowrap px-3 py-3">{formatCurrency(row.additionalCharge, 'INR')}</td>
                          <td className="whitespace-nowrap px-3 py-3">0%</td>
                          <td className="whitespace-nowrap px-3 py-3">{formatCurrency(0, 'INR')}</td>
                          <td className="whitespace-nowrap px-3 py-3">0%</td>
                          <td className="whitespace-nowrap px-3 py-3">{formatCurrency(0, 'INR')}</td>
                          <td className="whitespace-nowrap px-3 py-3">
                            <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-1 text-xs text-blue-300">{row.status}</span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-3">{row.channelId}</td>
                          <td className="whitespace-nowrap px-3 py-3">{row.channel}</td>
                          <td className="whitespace-nowrap px-3 py-3">{row.partyId}</td>
                          <td className="whitespace-nowrap px-3 py-3">{row.party}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-white/10 px-4 py-3 text-sm text-slate-400">
                Showing {totalResults ? 1 : 0} to {totalResults} of {totalResults} Results
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}

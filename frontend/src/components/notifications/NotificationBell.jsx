import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Bell, AlertTriangle, Clock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { cn } from '../../lib/utils';

const STORAGE_KEY = 'inventorypro_notifications_seen_v1';
const MAX_SEEN = 200;

function loadSeenIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function persistSeenIds(set) {
  const arr = [...set].slice(-MAX_SEEN);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const itemsRef = useRef(items);
  const [loading, setLoading] = useState(false);
  const [seenIds, setSeenIds] = useState(() => new Set());

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  /** Load “seen” alert IDs from MongoDB via profile; fall back to localStorage if offline */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/auth/profile');
        const list = data.user?.preferences?.notificationSeenAlertIds;
        if (!cancelled && Array.isArray(list)) {
          const next = new Set(list.map(String));
          setSeenIds(next);
          persistSeenIds(next);
          return;
        }
      } catch {
        /* use local cache */
      }
      if (!cancelled) setSeenIds(loadSeenIds());
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const fetchAlerts = useCallback(async (showSpinner) => {
    if (showSpinner) setLoading(true);
    try {
      const [lowRes, pendingRes, recentRes] = await Promise.all([
        api.get('/inventory/low-stock', { params: { threshold: 20 } }),
        api.get('/transaction', { params: { status: 'PENDING', limit: 20 } }),
        api.get('/transaction', { params: { limit: 40 } })
      ]);

      const list = [];

      for (const inv of lowRes.data?.items || []) {
        const p = inv.productId;
        const name = p?.name || 'Product';
        const sku = p?.sku ? ` (${p.sku})` : '';
        const qty = inv.availableQuantity ?? inv.quantity ?? 0;
        list.push({
          id: `low-${inv._id}`,
          title: 'Low stock',
          detail: `${name}${sku} — ${qty} available`,
          href: '/inventory',
          Icon: AlertTriangle
        });
      }

      const txSeen = new Set();

      for (const t of pendingRes.data?.transactions || []) {
        const id = String(t._id);
        if (txSeen.has(id)) continue;
        txSeen.add(id);
        list.push({
          id: `tx-${id}`,
          title: 'Pending transaction',
          detail: t.transactionNumber || 'Transaction',
          href: '/transactions',
          Icon: Clock
        });
      }

      for (const t of recentRes.data?.transactions || []) {
        if (t.type !== 'SALE' || t.paymentStatus !== 'PENDING') continue;
        const id = String(t._id);
        if (txSeen.has(id)) continue;
        txSeen.add(id);
        const amt =
          t.finalAmount != null ? ` — $${Number(t.finalAmount).toFixed(2)}` : '';
        list.push({
          id: `tx-${id}`,
          title: 'Payment pending',
          detail: `${t.transactionNumber || 'Sale'}${amt}`,
          href: '/billing',
          Icon: Clock
        });
      }

      setItems(list);
    } catch {
      setItems([]);
    } finally {
      if (showSpinner) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts(false);
  }, [fetchAlerts]);

  useEffect(() => {
    if (open) fetchAlerts(true);
  }, [open, fetchAlerts]);

  const unreadCount = items.filter((n) => !seenIds.has(n.id)).length;

  const handleOpenChange = (next) => {
    setOpen(next);
    if (!next) {
      const snapshot = itemsRef.current;
      const newIds = snapshot.map((n) => n.id);
      setSeenIds((prev) => {
        const nextSet = new Set(prev);
        newIds.forEach((id) => nextSet.add(id));
        persistSeenIds(nextSet);
        return nextSet;
      });
      api
        .post('/auth/notifications/mark-seen', { ids: newIds })
        .then((res) => {
          const merged = res.data?.notificationSeenAlertIds;
          if (Array.isArray(merged)) {
            const s = new Set(merged.map(String));
            setSeenIds(s);
            persistSeenIds(s);
          }
        })
        .catch(() => {});
    }
  };

  return (
    <DropdownMenu.Root open={open} onOpenChange={handleOpenChange}>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className={cn(
            'relative rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500'
          )}
          aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 w-[min(100vw-2rem,22rem)] rounded-xl border border-slate-700/80 bg-slate-900/95 p-1 shadow-xl backdrop-blur-xl"
          sideOffset={8}
          align="end"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <div className="border-b border-white/10 px-3 py-2">
            <p className="text-sm font-semibold text-white">Alerts</p>
            <p className="text-xs text-slate-500">Low stock & open transactions (synced to your account)</p>
          </div>

          <div className="max-h-80 overflow-y-auto py-1">
            {loading && open ? (
              <p className="px-3 py-6 text-center text-sm text-slate-500">Loading…</p>
            ) : items.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-slate-500">
                No alerts right now.
              </p>
            ) : (
              items.map((n) => {
                const Icon = n.Icon;
                return (
                  <DropdownMenu.Item key={n.id} asChild>
                    <Link
                      to={n.href}
                      className={cn(
                        'flex cursor-pointer items-start gap-3 rounded-lg px-3 py-2.5 text-left outline-none',
                        'hover:bg-white/10 focus:bg-white/10',
                        !seenIds.has(n.id) && 'bg-cyan-500/5'
                      )}
                      onClick={() => setOpen(false)}
                    >
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-cyan-400">{n.title}</p>
                        <p className="truncate text-sm text-slate-200">{n.detail}</p>
                      </div>
                      <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-600" />
                    </Link>
                  </DropdownMenu.Item>
                );
              })
            )}
          </div>

          <div className="border-t border-white/10 px-2 py-1.5">
            <DropdownMenu.Item
              className="w-full cursor-pointer rounded-md px-2 py-1.5 text-left text-xs text-slate-500 outline-none hover:bg-white/5 hover:text-slate-300"
              onSelect={() => fetchAlerts(true)}
            >
              Refresh
            </DropdownMenu.Item>
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

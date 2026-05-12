import React, { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import Header from '../../components/layout/Header';
import Billing from '../Billing';
import Transactions from '../Transactions';
import { cn } from '../../lib/utils';

/** Sales & billing hub — Billing + Transactions (legacy modules). */
export default function SalesOrders({ user }) {
  const [tab, setTab] = useState('transactions');

  return (
    <div className="min-h-screen bg-slate-950">
      <Header title="Sales & orders" user={user} />
      <div className="border-b border-white/10 bg-slate-950/80 px-6 pt-2 backdrop-blur">
        <Tabs.Root value={tab} onValueChange={setTab}>
          <Tabs.List className="flex gap-1">
            {[
              { id: 'transactions', label: 'All transactions' },
              { id: 'billing', label: 'Billing & payments' }
            ].map((t) => (
              <Tabs.Trigger
                key={t.id}
                value={t.id}
                className={cn(
                  'rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors',
                  'text-slate-400 hover:text-white data-[state=active]:border data-[state=active]:border-b-0 data-[state=active]:border-white/10 data-[state=active]:bg-slate-900/80 data-[state=active]:text-white'
                )}
              >
                {t.label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
          <Tabs.Content value="transactions" className="pt-2">
            <Transactions user={user} embed />
          </Tabs.Content>
          <Tabs.Content value="billing" className="pt-2">
            <Billing user={user} embed />
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  );
}

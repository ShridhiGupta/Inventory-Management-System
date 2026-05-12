import React, { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import Header from '../../components/layout/Header';
import Warehouse from '../Warehouse';
import Stores from '../Stores';
import { cn } from '../../lib/utils';

/** Warehouses + stores — legacy modules composed under Inventory ops. */
export default function InventoryLocations({ user }) {
  const [tab, setTab] = useState('warehouses');

  return (
    <div className="min-h-screen bg-slate-950">
      <Header title="Inventory · locations" user={user} />
      <div className="border-b border-white/10 bg-slate-950/80 px-6 pt-2 backdrop-blur">
        <Tabs.Root value={tab} onValueChange={setTab}>
          <Tabs.List className="flex gap-1">
            {[
              { id: 'warehouses', label: 'Warehouses' },
              { id: 'stores', label: 'Stores / outlets' }
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
          <Tabs.Content value="warehouses" className="pt-2">
            <Warehouse user={user} embed />
          </Tabs.Content>
          <Tabs.Content value="stores" className="pt-2">
            <Stores user={user} embed />
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  );
}

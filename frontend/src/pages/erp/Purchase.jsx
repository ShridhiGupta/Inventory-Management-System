import React from 'react';
import { Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { 
  Store, 
  ShoppingCart, 
  FileText, 
  Banknote,
  Boxes
} from 'lucide-react';
import { cn } from '../../lib/utils';
import Header from '../../components/layout/Header';
import Vendors from '../../components/purchase/Vendors';
import PurchaseOrders from '../../components/purchase/PurchaseOrders';
import VendorInvoices from '../../components/purchase/VendorInvoices';
import InvoiceSettlement from '../../components/purchase/InvoiceSettlement';

const purchaseMenu = [
  { 
    title: 'Vendors', 
    icon: Store, 
    path: 'vendors' 
  },
  { 
    title: 'Purchase Orders', 
    icon: ShoppingCart, 
    path: 'orders' 
  },
  { 
    title: 'Vendor Invoices', 
    icon: FileText, 
    path: 'invoices' 
  },
  { 
    title: 'Invoice Settlement', 
    icon: Banknote, 
    path: 'settlements' 
  }
];

function PurchaseSidebar() {
  return (
    <div className="w-64 flex-shrink-0 border-r border-white/10 bg-slate-900/50 hidden md:block overflow-y-auto min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-2">
        <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
          Purchase Management
        </h3>
        {purchaseMenu.map((menu) => (
          <NavLink
            key={menu.path}
            to={menu.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 text-sm font-medium px-3 py-2.5 rounded-lg transition-colors",
              isActive 
                ? "bg-blue-500/20 text-blue-400" 
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            )}
          >
            <menu.icon className="h-4 w-4" />
            {menu.title}
          </NavLink>
        ))}
      </div>
    </div>
  );
}

export default function Purchase({ user }) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <Header title="Purchase Management" user={user} />
      
      <div className="flex flex-1 overflow-hidden">
        <PurchaseSidebar />
        
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route index element={<Navigate to="vendors" replace />} />
            <Route path="vendors" element={<Vendors />} />
            <Route path="orders" element={<PurchaseOrders />} />
            <Route path="invoices" element={<VendorInvoices />} />
            <Route path="settlements" element={<InvoiceSettlement />} />
            
            <Route path="*" element={
              <div className="p-8 flex flex-col items-center justify-center text-slate-400 h-full">
                <Boxes className="h-16 w-16 mb-4 opacity-50" />
                <h2 className="text-xl font-medium text-white mb-2">Module Under Construction</h2>
                <p>This section is currently being developed.</p>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </div>
  );
}

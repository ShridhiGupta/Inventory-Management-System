import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { 
  Search, Plus, MoreHorizontal, Filter, 
  Calendar, FileText, CheckCircle2, CircleDashed
} from 'lucide-react';

export default function PurchaseOrders() {
  const [search, setSearch] = useState('');
  
  // Mock Data for UI demonstration
  const [orders] = useState([
    { 
      id: 'PO-2023-001', destName: 'Main Warehouse', destType: 'Warehouse', 
      invoiceNo: 'INV-9021', vendor: 'Global Tech Suppliers', 
      date: 'Oct 24, 2023', time: '10:30 AM', stockIn: 'Complete', status: 'Fulfilled' 
    },
    { 
      id: 'PO-2023-002', destName: 'Downtown Store', destType: 'Retail', 
      invoiceNo: 'INV-9022', vendor: 'Acme Corp', 
      date: 'Oct 25, 2023', time: '02:15 PM', stockIn: 'Partial', status: 'In Transit' 
    },
    { 
      id: 'PO-2023-003', destName: 'Main Warehouse', destType: 'Warehouse', 
      invoiceNo: 'INV-9025', vendor: 'Fresh Foods Distributors', 
      date: 'Oct 26, 2023', time: '09:00 AM', stockIn: 'Pending', status: 'Draft' 
    }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Fulfilled': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'In Transit': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Draft': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      default: return 'bg-slate-800 text-slate-300';
    }
  };

  return (
    <div className="p-6 h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="text-xs text-slate-500 font-medium tracking-wide uppercase">
            Purchase &gt; Purchase Orders
          </div>
          <h1 className="text-2xl font-bold text-white">Purchase Orders</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-slate-800 text-white rounded-lg border border-white/10 hover:bg-slate-700 transition-colors flex items-center gap-2 text-sm font-medium">
            Create PO Using Requisition
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium">
            <Plus className="h-4 w-4" /> Create Purchase Order
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <Card className="bg-slate-900 border-white/5 p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="w-full sm:w-auto flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Date Range</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input 
                type="text"
                placeholder="Select Date Range"
                className="w-full bg-slate-800 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-slate-300 focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>
          </div>
          <div className="w-full sm:w-auto flex-1 min-w-[150px]">
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Destination</label>
            <select className="w-full bg-slate-800 border border-white/10 rounded-lg py-2 px-3 text-slate-300 focus:outline-none focus:border-blue-500 text-sm appearance-none">
              <option value="">All Destinations</option>
              <option value="warehouse">Main Warehouse</option>
              <option value="store">Downtown Store</option>
            </select>
          </div>
          <div className="w-full sm:w-auto flex-1 min-w-[150px]">
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Payment Status</label>
            <select className="w-full bg-slate-800 border border-white/10 rounded-lg py-2 px-3 text-slate-300 focus:outline-none focus:border-blue-500 text-sm appearance-none">
              <option value="">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>
          <div className="w-full sm:w-auto flex-1 min-w-[150px]">
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Vendor</label>
            <select className="w-full bg-slate-800 border border-white/10 rounded-lg py-2 px-3 text-slate-300 focus:outline-none focus:border-blue-500 text-sm appearance-none">
              <option value="">All Vendors</option>
            </select>
          </div>
          <button className="w-full sm:w-auto px-6 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm font-medium flex items-center justify-center gap-2 h-[38px]">
            <Filter className="h-4 w-4" /> Apply Filter
          </button>
        </div>
      </Card>

      {/* Table Card */}
      <Card className="bg-slate-900 border-white/5 flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 p-12">
              <FileText className="h-16 w-16 mb-4 opacity-20" />
              <p className="text-lg font-medium text-white mb-1">No purchase orders found</p>
              <p className="text-sm">Try adjusting your filters or create a new order.</p>
            </div>
          ) : (
            <table className="w-full text-sm text-left text-slate-300 whitespace-nowrap">
              <thead className="text-xs uppercase bg-slate-800/80 text-slate-400 sticky top-0 z-10 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 font-semibold">PO ID</th>
                  <th className="px-6 py-4 font-semibold">Destination Name</th>
                  <th className="px-6 py-4 font-semibold">Destination Type</th>
                  <th className="px-6 py-4 font-semibold">Invoice Number</th>
                  <th className="px-6 py-4 font-semibold">Vendor Name</th>
                  <th className="px-6 py-4 font-semibold">Invoice Date & Time</th>
                  <th className="px-6 py-4 font-semibold text-center">Stock In</th>
                  <th className="px-6 py-4 font-semibold">Fulfillment Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4 font-medium text-blue-400 cursor-pointer hover:underline">{order.id}</td>
                    <td className="px-6 py-4 text-white font-medium">{order.destName}</td>
                    <td className="px-6 py-4 text-slate-400">
                      <span className="px-2.5 py-1 bg-slate-800 rounded-md text-xs">{order.destType}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">{order.invoiceNo || '—'}</td>
                    <td className="px-6 py-4 text-slate-300">{order.vendor}</td>
                    <td className="px-6 py-4">
                      <div className="text-slate-300">{order.date}</div>
                      <div className="text-xs text-slate-500">{order.time}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`flex items-center justify-center gap-1.5 text-xs font-medium ${
                        order.stockIn === 'Complete' ? 'text-emerald-400' : 
                        order.stockIn === 'Partial' ? 'text-orange-400' : 'text-slate-500'
                      }`}>
                        {order.stockIn === 'Complete' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <CircleDashed className="h-3.5 w-3.5" />}
                        {order.stockIn}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-1.5 text-slate-400 hover:text-white transition-colors rounded hover:bg-slate-800 opacity-0 group-hover:opacity-100">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Footer / Pagination */}
        {orders.length > 0 && (
          <div className="p-4 border-t border-white/5 flex items-center justify-between bg-slate-900/50">
            <div className="text-sm text-slate-400">
              Showing <span className="text-white font-medium">1</span> to <span className="text-white font-medium">{orders.length}</span> of <span className="text-white font-medium">{orders.length}</span> results
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 text-sm bg-slate-800 border border-white/10 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-50">
                Previous
              </button>
              <button className="px-3 py-1.5 text-sm bg-blue-600 rounded-lg text-white font-medium">
                1
              </button>
              <button className="px-3 py-1.5 text-sm bg-slate-800 border border-white/10 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-50">
                Next
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

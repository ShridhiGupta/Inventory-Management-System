import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { 
  Search, Plus, Download, Filter, 
  FileText, MoreHorizontal 
} from 'lucide-react';

export default function VendorInvoices() {
  const [search, setSearch] = useState('');
  
  // Mock Data for UI demonstration
  const [invoices] = useState([
    { 
      id: 'VI-2023-001', invoiceNo: 'INV-9021', vendor: 'Global Tech Suppliers', 
      poId: 'PO-2023-001', totalAmount: 4500.00, amountPaid: 4500.00, amountLeft: 0,
      creationDate: 'Oct 24, 2023', dueDate: 'Nov 24, 2023', createdBy: 'Admin',
      remarks: 'Initial stock', status: 'Paid' 
    },
    { 
      id: 'VI-2023-002', invoiceNo: 'INV-9022', vendor: 'Acme Corp', 
      poId: 'PO-2023-002', totalAmount: 12500.50, amountPaid: 5000.00, amountLeft: 7500.50,
      creationDate: 'Oct 25, 2023', dueDate: 'Nov 10, 2023', createdBy: 'Admin',
      remarks: 'Partial delivery', status: 'Partially Paid' 
    },
    { 
      id: 'VI-2023-003', invoiceNo: 'INV-9025', vendor: 'Fresh Foods Distributors', 
      poId: 'PO-2023-003', totalAmount: 840.00, amountPaid: 0, amountLeft: 840.00,
      creationDate: 'Oct 26, 2023', dueDate: 'Nov 02, 2023', createdBy: 'System',
      remarks: 'Urgent', status: 'Unpaid' 
    }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Partially Paid': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'Unpaid': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-slate-800 text-slate-300';
    }
  };

  return (
    <div className="p-6 h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="text-xs text-slate-500 font-medium tracking-wide uppercase">
            Purchase &gt; Vendor Invoices
          </div>
          <h1 className="text-2xl font-bold text-white">Vendor Invoices</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-white/10 hover:bg-slate-700 transition-colors flex items-center gap-2 text-sm font-medium">
            <Download className="h-4 w-4" /> Download List
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium">
            <Plus className="h-4 w-4" /> Create Invoice
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <Card className="bg-slate-900 border-white/5 p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="w-full sm:w-auto flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Invoice ID, PO ID..."
                className="w-full bg-slate-800 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-slate-300 focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>
          </div>
          <div className="w-full sm:w-auto flex-1 min-w-[150px]">
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Vendor</label>
            <select className="w-full bg-slate-800 border border-white/10 rounded-lg py-2 px-3 text-slate-300 focus:outline-none focus:border-blue-500 text-sm appearance-none">
              <option value="">All Vendors</option>
              <option value="global">Global Tech Suppliers</option>
            </select>
          </div>
          <div className="w-full sm:w-auto flex-1 min-w-[150px]">
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Invoice Status</label>
            <select className="w-full bg-slate-800 border border-white/10 rounded-lg py-2 px-3 text-slate-300 focus:outline-none focus:border-blue-500 text-sm appearance-none">
              <option value="">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="unpaid">Unpaid</option>
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
          {invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 p-12">
              <FileText className="h-16 w-16 mb-4 opacity-20" />
              <p className="text-lg font-medium text-white mb-1">No invoices found</p>
              <p className="text-sm">Try adjusting your filters or create a new invoice.</p>
            </div>
          ) : (
            <table className="w-full text-sm text-left text-slate-300 whitespace-nowrap">
              <thead className="text-xs uppercase bg-slate-800/80 text-slate-400 sticky top-0 z-10 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 font-semibold">Invoice ID</th>
                  <th className="px-6 py-4 font-semibold">Invoice Number</th>
                  <th className="px-6 py-4 font-semibold">Vendor Name</th>
                  <th className="px-6 py-4 font-semibold">PO ID</th>
                  <th className="px-6 py-4 font-semibold text-right">Total Amount</th>
                  <th className="px-6 py-4 font-semibold text-right">Amount Paid</th>
                  <th className="px-6 py-4 font-semibold text-right">Amount Left</th>
                  <th className="px-6 py-4 font-semibold">Creation Date</th>
                  <th className="px-6 py-4 font-semibold">Due Date</th>
                  <th className="px-6 py-4 font-semibold">Created By</th>
                  <th className="px-6 py-4 font-semibold">Remarks</th>
                  <th className="px-6 py-4 font-semibold text-center">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4 font-medium text-blue-400 cursor-pointer hover:underline">{inv.id}</td>
                    <td className="px-6 py-4 text-slate-300">{inv.invoiceNo}</td>
                    <td className="px-6 py-4 text-white font-medium">{inv.vendor}</td>
                    <td className="px-6 py-4 text-slate-400 hover:text-blue-400 cursor-pointer">{inv.poId}</td>
                    <td className="px-6 py-4 text-right font-medium text-white">₹{inv.totalAmount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right text-emerald-400">₹{inv.amountPaid.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right text-orange-400">₹{inv.amountLeft.toLocaleString()}</td>
                    <td className="px-6 py-4 text-slate-400">{inv.creationDate}</td>
                    <td className="px-6 py-4 text-slate-400">{inv.dueDate}</td>
                    <td className="px-6 py-4 text-slate-500">{inv.createdBy}</td>
                    <td className="px-6 py-4 text-slate-500 truncate max-w-[150px]" title={inv.remarks}>{inv.remarks || '—'}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(inv.status)}`}>
                        {inv.status}
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
        {invoices.length > 0 && (
          <div className="p-4 border-t border-white/5 flex items-center justify-between bg-slate-900/50">
            <div className="text-sm text-slate-400">
              Showing <span className="text-white font-medium">1</span> to <span className="text-white font-medium">{invoices.length}</span> of <span className="text-white font-medium">{invoices.length}</span> results
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

import React, { useState } from 'react';
import { Card, CardContent } from '../ui/Card';
import { 
  Banknote, AlertCircle, CheckCircle, Clock,
  Search, Download, Eye, IndianRupee,
  MoreHorizontal
} from 'lucide-react';

export default function InvoiceSettlement() {
  const [search, setSearch] = useState('');
  
  // Mock Data for UI demonstration
  const [settlements] = useState([
    { 
      id: 'SET-9912', invoiceId: 'INV-9021', vendor: 'Global Tech Suppliers', 
      totalInvoice: 4500.00, paidAmount: 4500.00, remainingAmount: 0,
      paymentMethod: 'Bank Transfer', settlementDate: 'Oct 25, 2023', status: 'Settled' 
    },
    { 
      id: 'SET-9913', invoiceId: 'INV-9022', vendor: 'Acme Corp', 
      totalInvoice: 12500.50, paidAmount: 5000.00, remainingAmount: 7500.50,
      paymentMethod: 'Credit Card', settlementDate: 'Oct 26, 2023', status: 'Partial' 
    },
    { 
      id: 'SET-9914', invoiceId: 'INV-9025', vendor: 'Fresh Foods Distributors', 
      totalInvoice: 840.00, paidAmount: 0, remainingAmount: 840.00,
      paymentMethod: '—', settlementDate: '—', status: 'Pending' 
    }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Settled': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Partial': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'Pending': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-slate-800 text-slate-300';
    }
  };

  return (
    <div className="p-6 h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="text-xs text-slate-500 font-medium tracking-wide uppercase">
          Purchase &gt; Invoice Settlement
        </div>
        <h1 className="text-2xl font-bold text-white">Invoice Settlement</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-white/5">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-red-500/10 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Total Pending</p>
              <p className="text-2xl font-semibold text-white">₹8,340.50</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-900 border-white/5">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-lg">
              <IndianRupee className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Paid Amount</p>
              <p className="text-2xl font-semibold text-white">₹9,500.00</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-white/5">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 rounded-lg">
              <Clock className="h-6 w-6 text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Overdue Invoices</p>
              <p className="text-2xl font-semibold text-white">3</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-white/5">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <CheckCircle className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Settled Today</p>
              <p className="text-2xl font-semibold text-white">5</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID or Vendor..."
              className="w-full bg-slate-900 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Table Card */}
      <Card className="bg-slate-900 border-white/5 flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          {settlements.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 p-12">
              <Banknote className="h-16 w-16 mb-4 opacity-20" />
              <p className="text-lg font-medium text-white mb-1">No settlements found</p>
              <p className="text-sm">There are no invoices waiting to be settled.</p>
            </div>
          ) : (
            <table className="w-full text-sm text-left text-slate-300 whitespace-nowrap">
              <thead className="text-xs uppercase bg-slate-800/80 text-slate-400 sticky top-0 z-10 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 font-semibold">Settlement ID</th>
                  <th className="px-6 py-4 font-semibold">Invoice ID</th>
                  <th className="px-6 py-4 font-semibold">Vendor Name</th>
                  <th className="px-6 py-4 font-semibold text-right">Total Invoice</th>
                  <th className="px-6 py-4 font-semibold text-right">Paid Amount</th>
                  <th className="px-6 py-4 font-semibold text-right">Remaining</th>
                  <th className="px-6 py-4 font-semibold text-center">Payment Method</th>
                  <th className="px-6 py-4 font-semibold">Settlement Date</th>
                  <th className="px-6 py-4 font-semibold text-center">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {settlements.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4 font-medium text-blue-400 cursor-pointer hover:underline">{item.id}</td>
                    <td className="px-6 py-4 text-slate-400 hover:text-blue-400 cursor-pointer">{item.invoiceId}</td>
                    <td className="px-6 py-4 text-white font-medium">{item.vendor}</td>
                    <td className="px-6 py-4 text-right text-slate-300">₹{item.totalInvoice.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right text-emerald-400">₹{item.paidAmount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right text-orange-400">₹{item.remainingAmount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-center text-slate-400">{item.paymentMethod}</td>
                    <td className="px-6 py-4 text-slate-400">{item.settlementDate}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.status !== 'Settled' && (
                          <button className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
                            <Banknote className="h-3 w-3" /> Settle
                          </button>
                        )}
                        <button className="text-xs font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-1">
                          <Eye className="h-3 w-3" /> View
                        </button>
                        <button className="text-xs font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-1">
                          <Download className="h-3 w-3" /> PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Footer / Pagination */}
        {settlements.length > 0 && (
          <div className="p-4 border-t border-white/5 flex items-center justify-between bg-slate-900/50">
            <div className="text-sm text-slate-400">
              Showing <span className="text-white font-medium">1</span> to <span className="text-white font-medium">{settlements.length}</span> of <span className="text-white font-medium">{settlements.length}</span> results
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

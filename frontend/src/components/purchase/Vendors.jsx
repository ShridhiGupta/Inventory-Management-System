import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { 
  Search, Plus, MoreHorizontal, User, 
  MapPin, Phone, Mail, Link as LinkIcon, PackagePlus
} from 'lucide-react';

export default function Vendors() {
  const [search, setSearch] = useState('');
  
  // Mock Data for UI demonstration
  const [vendors] = useState([
    { id: 'V001', name: 'Global Tech Suppliers', mobile: '+1 234 567 8900', email: 'contact@globaltech.com', address: '123 Silicon Valley, CA' },
    { id: 'V002', name: 'Acme Corp', mobile: '+1 987 654 3210', email: 'sales@acmecorp.com', address: '456 Industrial Pkwy, NY' },
    { id: 'V003', name: 'Fresh Foods Distributors', mobile: '+1 555 123 4567', email: 'hello@freshfoods.com', address: '789 Market St, TX' }
  ]);

  return (
    <div className="p-6 h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="text-xs text-slate-500 font-medium tracking-wide uppercase">
          Purchase &gt; Vendors
        </div>
        <h1 className="text-2xl font-bold text-white">Vendors</h1>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {/* Potential filters can go here */}
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto ml-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search vendors..."
              className="w-full bg-slate-900 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium whitespace-nowrap">
            <Plus className="h-4 w-4" /> Create Vendor
          </button>
        </div>
      </div>

      {/* Table Card */}
      <Card className="bg-slate-900 border-white/5 flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          {vendors.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 p-12">
              <User className="h-16 w-16 mb-4 opacity-20" />
              <p className="text-lg font-medium text-white mb-1">No vendors found</p>
              <p className="text-sm">Get started by creating a new vendor.</p>
              <button className="mt-4 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors flex items-center gap-2 text-sm">
                <Plus className="h-4 w-4" /> Create Vendor
              </button>
            </div>
          ) : (
            <table className="w-full text-sm text-left text-slate-300">
              <thead className="text-xs uppercase bg-slate-800/80 text-slate-400 sticky top-0 z-10 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 font-semibold w-16 text-center">S.No</th>
                  <th className="px-6 py-4 font-semibold">Vendor Name</th>
                  <th className="px-6 py-4 font-semibold">Mobile Number</th>
                  <th className="px-6 py-4 font-semibold">Email Address</th>
                  <th className="px-6 py-4 font-semibold">Address</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {vendors.map((v, index) => (
                  <tr key={v.id} className="hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4 text-center text-slate-500 font-medium">{index + 1}</td>
                    <td className="px-6 py-4 font-medium text-white">{v.name}</td>
                    <td className="px-6 py-4 text-slate-400">
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 opacity-50" />
                        {v.mobile}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 opacity-50" />
                        {v.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-400 truncate max-w-[200px]">
                      <div className="flex items-center gap-2 truncate">
                        <MapPin className="h-3 w-3 opacity-50 shrink-0" />
                        <span className="truncate">{v.address}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 opacity-0 group-hover:opacity-100">
                          <LinkIcon className="h-3 w-3" /> Assign Source
                        </button>
                        <button className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 opacity-0 group-hover:opacity-100">
                          <PackagePlus className="h-3 w-3" /> Assign Products
                        </button>
                        <button className="p-1 text-slate-400 hover:text-white transition-colors rounded hover:bg-slate-800">
                          <MoreHorizontal className="h-4 w-4" />
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
        {vendors.length > 0 && (
          <div className="p-4 border-t border-white/5 flex items-center justify-between bg-slate-900/50">
            <div className="text-sm text-slate-400">
              Showing <span className="text-white font-medium">1</span> to <span className="text-white font-medium">{vendors.length}</span> of <span className="text-white font-medium">{vendors.length}</span> results
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

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../ui/Card';
import { Search, Plus, Trash2, Edit, Activity, Filter, Download, Upload, MoreHorizontal } from 'lucide-react';
import api from '../../../lib/api';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  useEffect(() => {
    fetchProducts();
  }, [search]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/catalog/products', { params: { search, limit: 50 } });
      setProducts(res.data.products || res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Product Catalog</h1>
          <p className="text-sm text-slate-400">Manage your entire product inventory</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-slate-800 text-white rounded-lg border border-white/10 hover:bg-slate-700 transition-colors flex items-center gap-2">
            <Upload className="h-4 w-4" /> Import
          </button>
          <button className="px-4 py-2 bg-slate-800 text-white rounded-lg border border-white/10 hover:bg-slate-700 transition-colors flex items-center gap-2">
            <Download className="h-4 w-4" /> Export
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Product
          </button>
        </div>
      </div>

      <Card className="bg-slate-900 border-white/5 flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, SKU, or barcode..."
              className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button className="p-2 bg-white/5 border border-white/10 rounded-lg text-slate-400 hover:text-white transition-colors flex items-center gap-2">
            <Filter className="h-4 w-4" /> Filters
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Activity className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <Package className="h-12 w-12 mb-4 opacity-50" />
              <p>No products found in the catalog.</p>
            </div>
          ) : (
            <table className="w-full text-sm text-left text-slate-300">
              <thead className="text-xs uppercase bg-slate-800/50 text-slate-400 sticky top-0">
                <tr>
                  <th className="px-4 py-3 w-10 text-center">
                    <input type="checkbox" className="rounded border-white/10 bg-white/5" />
                  </th>
                  <th className="px-6 py-3 font-medium">Product Info</th>
                  <th className="px-6 py-3 font-medium">SKU / Barcode</th>
                  <th className="px-6 py-3 font-medium">Category & Brand</th>
                  <th className="px-6 py-3 font-medium text-right">Price (MRP)</th>
                  <th className="px-6 py-3 font-medium text-right">Stock</th>
                  <th className="px-6 py-3 font-medium text-center">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-800/50 group">
                    <td className="px-4 py-4 text-center">
                      <input type="checkbox" className="rounded border-white/10 bg-white/5" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                          {p.images?.[0] ? (
                            <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-slate-500 font-bold text-xs">{p.name?.substring(0, 2).toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white line-clamp-1">{p.name}</p>
                          <p className="text-xs text-slate-500 line-clamp-1">{p.shortDescription || 'No description'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      <div>{p.sku || '—'}</div>
                      <div className="text-xs text-slate-500">{p.barcode || '—'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white">{p.category?.name || '—'}</div>
                      <div className="text-xs text-slate-500">{p.brand?.name || '—'}</div>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-white">
                      ₹{p.pricing?.mrp?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        p.inventory?.totalStock > 10 ? 'bg-emerald-500/10 text-emerald-400' :
                        p.inventory?.totalStock > 0 ? 'bg-orange-500/10 text-orange-400' :
                        'bg-red-500/10 text-red-400'
                      }`}>
                        {p.inventory?.totalStock || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        p.status === 'ACTIVE' ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-500/10 text-slate-400'
                      }`}>
                        {p.status || 'DRAFT'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1 text-slate-400 hover:text-blue-400 transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-slate-400 hover:text-white transition-colors">
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
      </Card>
    </div>
  );
}

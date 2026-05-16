import React, { useState, useEffect } from 'react';
import { Card } from '../../ui/Card';
import { Search, Plus, Trash2, Edit, Activity, Ticket } from 'lucide-react';
import api from '../../../lib/api';

export default function VoucherManagement() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [formData, setFormData] = useState({ 
    code: '', 
    discountType: 'PERCENTAGE', 
    discountValue: 0, 
    minOrderValue: 0,
    maxDiscount: 0,
    validFrom: '',
    validUntil: '',
    usageLimit: 100,
    status: 'ACTIVE' 
  });

  useEffect(() => {
    fetchVouchers();
  }, [search]);

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/catalog/vouchers', { params: { search } });
      setVouchers(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this voucher?")) {
      try {
        await api.delete(`/catalog/vouchers/${id}`);
        fetchVouchers();
      } catch (err) {
        alert("Failed to delete voucher.");
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingVoucher) {
        await api.put(`/catalog/vouchers/${editingVoucher._id}`, formData);
      } else {
        await api.post('/catalog/vouchers', formData);
      }
      setIsModalOpen(false);
      fetchVouchers();
    } catch (err) {
      alert("Failed to save voucher.");
    }
  };

  const openEdit = (voucher) => {
    setEditingVoucher(voucher);
    setFormData({ 
      code: voucher.code, 
      discountType: voucher.discountType || 'PERCENTAGE', 
      discountValue: voucher.discountValue || 0, 
      minOrderValue: voucher.minOrderValue || 0,
      maxDiscount: voucher.maxDiscount || 0,
      validFrom: voucher.validFrom ? new Date(voucher.validFrom).toISOString().split('T')[0] : '',
      validUntil: voucher.validUntil ? new Date(voucher.validUntil).toISOString().split('T')[0] : '',
      usageLimit: voucher.usageLimit || 100,
      status: voucher.status || 'ACTIVE' 
    });
    setIsModalOpen(true);
  };

  const openCreate = () => {
    setEditingVoucher(null);
    setFormData({ 
      code: '', 
      discountType: 'PERCENTAGE', 
      discountValue: 0, 
      minOrderValue: 0,
      maxDiscount: 0,
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: '',
      usageLimit: 100,
      status: 'ACTIVE' 
    });
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Vouchers & Coupons</h1>
          <p className="text-sm text-slate-400">Manage promotional discount codes</p>
        </div>
        <button onClick={openCreate} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Voucher
        </button>
      </div>

      <Card className="bg-slate-900 border-white/5 flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by code..."
              className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Activity className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : vouchers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <Ticket className="h-12 w-12 mb-2 opacity-50" />
              <p>No vouchers found.</p>
            </div>
          ) : (
            <table className="w-full text-sm text-left text-slate-300">
              <thead className="text-xs uppercase bg-slate-800/50 text-slate-400 sticky top-0">
                <tr>
                  <th className="px-6 py-3 font-medium">Code</th>
                  <th className="px-6 py-3 font-medium">Discount</th>
                  <th className="px-6 py-3 font-medium">Valid Until</th>
                  <th className="px-6 py-3 font-medium">Usage</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {vouchers.map((v) => (
                  <tr key={v._id} className="hover:bg-slate-800/50">
                    <td className="px-6 py-4 font-medium text-white">{v.code}</td>
                    <td className="px-6 py-4 text-emerald-400 font-medium">
                      {v.discountType === 'PERCENTAGE' ? `${v.discountValue}%` : `₹${v.discountValue}`}
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {v.validUntil ? new Date(v.validUntil).toLocaleDateString() : 'No Expiry'}
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {v.timesUsed || 0} / {v.usageLimit}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs ${v.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-500'}`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(v)} className="p-1 text-slate-400 hover:text-blue-400 transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(v._id)} className="p-1 text-slate-400 hover:text-red-400 transition-colors">
                          <Trash2 className="h-4 w-4" />
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg p-6 my-8">
            <h2 className="text-xl font-bold text-white mb-4">{editingVoucher ? 'Edit Voucher' : 'Add Voucher'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Voucher Code *</label>
                <input required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500 focus:outline-none uppercase" placeholder="e.g. SUMMER50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Discount Type</label>
                  <select value={formData.discountType} onChange={e => setFormData({...formData, discountType: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500 focus:outline-none">
                    <option value="PERCENTAGE">Percentage</option>
                    <option value="FIXED">Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Discount Value *</label>
                  <input type="number" step="0.01" required value={formData.discountValue} onChange={e => setFormData({...formData, discountValue: parseFloat(e.target.value)})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500 focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Min Order Value</label>
                  <input type="number" step="0.01" value={formData.minOrderValue} onChange={e => setFormData({...formData, minOrderValue: parseFloat(e.target.value)})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Max Discount Amount</label>
                  <input type="number" step="0.01" value={formData.maxDiscount} onChange={e => setFormData({...formData, maxDiscount: parseFloat(e.target.value)})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500 focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Valid From</label>
                  <input type="date" value={formData.validFrom} onChange={e => setFormData({...formData, validFrom: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Valid Until</label>
                  <input type="date" value={formData.validUntil} onChange={e => setFormData({...formData, validUntil: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500 focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Usage Limit</label>
                  <input type="number" value={formData.usageLimit} onChange={e => setFormData({...formData, usageLimit: parseInt(e.target.value)})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500 focus:outline-none">
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-300 hover:text-white">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

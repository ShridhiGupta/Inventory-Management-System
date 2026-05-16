import React, { useState, useEffect } from 'react';
import { Card } from '../../ui/Card';
import { Search, Plus, Trash2, Edit, Activity } from 'lucide-react';
import api from '../../../lib/api';

export default function TaxManagement() {
  const [taxes, setTaxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTax, setEditingTax] = useState(null);
  const [formData, setFormData] = useState({ name: '', percentage: 0, taxType: 'GST', hsnSacCode: '' });

  useEffect(() => {
    fetchTaxes();
  }, [search]);

  const fetchTaxes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/catalog/taxes', { params: { search } });
      setTaxes(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this tax?")) {
      try {
        await api.delete(`/catalog/taxes/${id}`);
        fetchTaxes();
      } catch (err) {
        alert("Failed to delete tax.");
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingTax) {
        await api.put(`/catalog/taxes/${editingTax._id}`, formData);
      } else {
        await api.post('/catalog/taxes', formData);
      }
      setIsModalOpen(false);
      fetchTaxes();
    } catch (err) {
      alert("Failed to save tax.");
    }
  };

  const openEdit = (tax) => {
    setEditingTax(tax);
    setFormData({ name: tax.name, percentage: tax.percentage || 0, taxType: tax.taxType || 'GST', hsnSacCode: tax.hsnSacCode || '' });
    setIsModalOpen(true);
  };

  const openCreate = () => {
    setEditingTax(null);
    setFormData({ name: '', percentage: 0, taxType: 'GST', hsnSacCode: '' });
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Tax Management</h1>
          <p className="text-sm text-slate-400">Configure global tax rates</p>
        </div>
        <button onClick={openCreate} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Tax
        </button>
      </div>

      <Card className="bg-slate-900 border-white/5 flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search taxes..."
              className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Activity className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : taxes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <p>No taxes configured.</p>
            </div>
          ) : (
            <table className="w-full text-sm text-left text-slate-300">
              <thead className="text-xs uppercase bg-slate-800/50 text-slate-400 sticky top-0">
                <tr>
                  <th className="px-6 py-3 font-medium">Tax Name</th>
                  <th className="px-6 py-3 font-medium">Rate (%)</th>
                  <th className="px-6 py-3 font-medium">Type</th>
                  <th className="px-6 py-3 font-medium">HSN/SAC</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {taxes.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-800/50">
                    <td className="px-6 py-4 font-medium text-white">{t.name}</td>
                    <td className="px-6 py-4 text-emerald-400 font-medium">{t.percentage}%</td>
                    <td className="px-6 py-4 text-slate-400">{t.taxType}</td>
                    <td className="px-6 py-4 text-slate-400">{t.hsnSacCode || '—'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(t)} className="p-1 text-slate-400 hover:text-blue-400 transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(t._id)} className="p-1 text-slate-400 hover:text-red-400 transition-colors">
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-white mb-4">{editingTax ? 'Edit Tax' : 'Add Tax'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Tax Name *</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Percentage *</label>
                  <input type="number" step="0.01" required value={formData.percentage} onChange={e => setFormData({...formData, percentage: parseFloat(e.target.value)})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Tax Type</label>
                  <select value={formData.taxType} onChange={e => setFormData({...formData, taxType: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500 focus:outline-none">
                    <option value="GST">GST</option>
                    <option value="VAT">VAT</option>
                    <option value="SALES_TAX">SALES_TAX</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">HSN/SAC Code</label>
                <input value={formData.hsnSacCode} onChange={e => setFormData({...formData, hsnSacCode: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500 focus:outline-none" />
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

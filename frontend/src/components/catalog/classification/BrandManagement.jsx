import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../ui/Card';
import { Search, Plus, Trash2, Edit, MoreHorizontal, Activity } from 'lucide-react';
import api from '../../../lib/api';

export default function BrandManagement() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Minimal modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [formData, setFormData] = useState({ name: '', manufacturer: '', sortOrder: 0 });

  useEffect(() => {
    fetchBrands();
  }, [search]);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      // In a real app we would use the new /catalog/manage/brands with search query
      const res = await api.get('/catalog/manage/brands', { params: { search } });
      setBrands(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this brand?")) {
      try {
        await api.delete(`/catalog/manage/brands/${id}`);
        fetchBrands();
      } catch (err) {
        alert("Failed to delete brand.");
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingBrand) {
        await api.put(`/catalog/manage/brands/${editingBrand._id}`, formData);
      } else {
        await api.post('/catalog/manage/brands', formData);
      }
      setIsModalOpen(false);
      fetchBrands();
    } catch (err) {
      alert("Failed to save brand.");
    }
  };

  const openEdit = (brand) => {
    setEditingBrand(brand);
    setFormData({ name: brand.name, manufacturer: brand.manufacturer || '', sortOrder: brand.sortOrder || 0 });
    setIsModalOpen(true);
  };

  const openCreate = () => {
    setEditingBrand(null);
    setFormData({ name: '', manufacturer: '', sortOrder: 0 });
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Brand Management</h1>
          <p className="text-sm text-slate-400">Manage your product brands</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-slate-800 text-white rounded-lg border border-white/10 hover:bg-slate-700 transition-colors">
            Bulk Operations
          </button>
          <button onClick={openCreate} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Brand
          </button>
        </div>
      </div>

      <Card className="bg-slate-900 border-white/5 flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search brands..."
              className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Activity className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : brands.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <p>No brands found.</p>
            </div>
          ) : (
            <table className="w-full text-sm text-left text-slate-300">
              <thead className="text-xs uppercase bg-slate-800/50 text-slate-400 sticky top-0">
                <tr>
                  <th className="px-6 py-3 font-medium">S.No</th>
                  <th className="px-6 py-3 font-medium">Brand Name</th>
                  <th className="px-6 py-3 font-medium">Manufacturer</th>
                  <th className="px-6 py-3 font-medium text-center">Sort Sequence</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {brands.map((b, i) => (
                  <tr key={b._id} className="hover:bg-slate-800/50">
                    <td className="px-6 py-4">{i + 1}</td>
                    <td className="px-6 py-4 font-medium text-white">{b.name}</td>
                    <td className="px-6 py-4 text-slate-400">{b.manufacturer || '—'}</td>
                    <td className="px-6 py-4 text-center">{b.sortOrder || 0}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(b)} className="p-1 text-slate-400 hover:text-blue-400 transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(b._id)} className="p-1 text-slate-400 hover:text-red-400 transition-colors">
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

      {/* Basic Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-white mb-4">{editingBrand ? 'Edit Brand' : 'Add Brand'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Brand Name *</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Manufacturer</label>
                <input value={formData.manufacturer} onChange={e => setFormData({...formData, manufacturer: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Sort Sequence</label>
                <input type="number" value={formData.sortOrder} onChange={e => setFormData({...formData, sortOrder: parseInt(e.target.value)})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500 focus:outline-none" />
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

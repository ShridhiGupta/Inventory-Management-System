import React, { useState, useEffect } from 'react';
import { Card } from '../../ui/Card';
import { Search, Plus, Trash2, Edit, Activity, Award } from 'lucide-react';
import api from '../../../lib/api';

export default function MembershipManagement() {
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMembership, setEditingMembership] = useState(null);
  const [formData, setFormData] = useState({ 
    planName: '', 
    benefits: '', 
    price: 0, 
    durationInMonths: 1, 
    status: 'ACTIVE' 
  });

  useEffect(() => {
    fetchMemberships();
  }, [search]);

  const fetchMemberships = async () => {
    setLoading(true);
    try {
      const res = await api.get('/catalog/memberships', { params: { search } });
      setMemberships(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this membership plan?")) {
      try {
        await api.delete(`/catalog/memberships/${id}`);
        fetchMemberships();
      } catch (err) {
        alert("Failed to delete membership plan.");
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingMembership) {
        await api.put(`/catalog/memberships/${editingMembership._id}`, formData);
      } else {
        await api.post('/catalog/memberships', formData);
      }
      setIsModalOpen(false);
      fetchMemberships();
    } catch (err) {
      alert("Failed to save membership plan.");
    }
  };

  const openEdit = (membership) => {
    setEditingMembership(membership);
    setFormData({ 
      planName: membership.planName, 
      benefits: membership.benefits?.join(', ') || '', 
      price: membership.price || 0, 
      durationInMonths: membership.durationInMonths || 1,
      status: membership.status || 'ACTIVE' 
    });
    setIsModalOpen(true);
  };

  const openCreate = () => {
    setEditingMembership(null);
    setFormData({ planName: '', benefits: '', price: 0, durationInMonths: 1, status: 'ACTIVE' });
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Membership Plans</h1>
          <p className="text-sm text-slate-400">Manage customer loyalty and membership tiers</p>
        </div>
        <button onClick={openCreate} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Plan
        </button>
      </div>

      <Card className="bg-slate-900 border-white/5 flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search memberships..."
              className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Activity className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : memberships.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <Award className="h-12 w-12 mb-2 opacity-50" />
              <p>No membership plans found.</p>
            </div>
          ) : (
            <table className="w-full text-sm text-left text-slate-300">
              <thead className="text-xs uppercase bg-slate-800/50 text-slate-400 sticky top-0">
                <tr>
                  <th className="px-6 py-3 font-medium">Plan Name</th>
                  <th className="px-6 py-3 font-medium">Duration</th>
                  <th className="px-6 py-3 font-medium">Price</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {memberships.map((m) => (
                  <tr key={m._id} className="hover:bg-slate-800/50">
                    <td className="px-6 py-4 font-medium text-white">{m.planName}</td>
                    <td className="px-6 py-4 text-slate-400">{m.durationInMonths} Months</td>
                    <td className="px-6 py-4 text-emerald-400 font-medium">₹{m.price || 0}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs ${m.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-500'}`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(m)} className="p-1 text-slate-400 hover:text-blue-400 transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(m._id)} className="p-1 text-slate-400 hover:text-red-400 transition-colors">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-white mb-4">{editingMembership ? 'Edit Plan' : 'Add Plan'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Plan Name *</label>
                <input required value={formData.planName} onChange={e => setFormData({...formData, planName: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Benefits (comma separated)</label>
                <textarea value={formData.benefits} onChange={e => setFormData({...formData, benefits: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500 focus:outline-none" rows="3" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Price *</label>
                  <input type="number" step="0.01" required value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Duration (Months) *</label>
                  <input type="number" required min="1" value={formData.durationInMonths} onChange={e => setFormData({...formData, durationInMonths: parseInt(e.target.value)})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500 focus:outline-none">
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
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

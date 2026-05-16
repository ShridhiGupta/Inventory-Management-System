import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { UserCircle, Search, Plus, Users, UserCheck, UserX, Briefcase } from 'lucide-react';
import Header from '../../components/layout/Header';
import { Card, CardContent } from '../../components/ui/Card';
import api from '../../lib/api';
import { getApiErrorMessage } from '../../lib/http';
import EmployeeModal from '../../components/employees/EmployeeModal';
import EmployeeTableActions from '../../components/employees/EmployeeTableActions';

export default function Employees({ user }) {
  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters & Pagination
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQ(q), 500);
    return () => clearTimeout(handler);
  }, [q]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { limit: 10, page };
      if (debouncedQ) params.search = debouncedQ;
      if (statusFilter) params.status = statusFilter;
      if (roleFilter) params.role = roleFilter;

      const { data } = await api.get('/employee', { params });
      setRows(data.employees || []);
      setStats(data.dashboardStats);
      setTotalPages(data.pagination?.pages || 1);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Could not load employees.'));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedQ, statusFilter, roleFilter, page]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = () => {
    setSelectedEmployee(null);
    setIsModalOpen(true);
  };

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  const handleView = (employee) => {
    // Simple view logic - could be expanded to a separate drawer/modal
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Header title="Employees" user={user} />
      
      <main className="space-y-6 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Employees</h1>
            <p className="text-sm text-slate-400">Manage all employees and staff</p>
          </div>
          {user?.role === 'SUPER_ADMIN' && (
            <button 
              onClick={handleCreate}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" /> Create Employee
            </button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-slate-900 border-white/5">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Total Employees</p>
                <p className="text-2xl font-semibold text-white">{stats?.totalEmployees || 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-white/5">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-lg">
                <UserCheck className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Active Employees</p>
                <p className="text-2xl font-semibold text-white">{stats?.activeEmployees || 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-white/5">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-red-500/10 rounded-lg">
                <UserX className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Inactive / Suspended</p>
                <p className="text-2xl font-semibold text-white">{stats?.inactiveEmployees || 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-white/5">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <Briefcase className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Departments</p>
                <p className="text-2xl font-semibold text-white">{stats?.departmentCounts ? Object.keys(stats.departmentCounts).length : 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900 p-4 rounded-xl border border-white/5">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              placeholder="Search employees by name, email, code..."
              className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:border-blue-500/50 focus:outline-none"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="rounded-lg border border-white/10 bg-white/5 py-2 px-3 text-sm text-white focus:border-blue-500/50 focus:outline-none w-full md:w-auto"
            >
              <option value="" className="bg-slate-800">All Statuses</option>
              <option value="ACTIVE" className="bg-slate-800">Active</option>
              <option value="INACTIVE" className="bg-slate-800">Inactive</option>
              <option value="SUSPENDED" className="bg-slate-800">Suspended</option>
            </select>
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              className="rounded-lg border border-white/10 bg-white/5 py-2 px-3 text-sm text-white focus:border-blue-500/50 focus:outline-none w-full md:w-auto"
            >
              <option value="" className="bg-slate-800">All Roles</option>
              <option value="SUPER_ADMIN" className="bg-slate-800">Super Admin</option>
              <option value="ADMIN" className="bg-slate-800">Admin</option>
              <option value="MANAGER" className="bg-slate-800">Manager</option>
              <option value="HR" className="bg-slate-800">HR</option>
              <option value="STAFF" className="bg-slate-800">Staff</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-500" />
          </div>
        ) : rows.length === 0 ? (
          <Card className="bg-slate-900 border-white/5">
            <CardContent className="py-16 text-center">
              <UserX className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <p className="text-lg font-medium text-slate-300">No employees found</p>
              <p className="text-sm text-slate-500">Adjust your search or filters, or create a new employee.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="bg-slate-900 border border-white/5 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-800/50 text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">S.No</th>
                    <th className="px-4 py-3 font-medium">Full Name</th>
                    <th className="px-4 py-3 font-medium">Username</th>
                    <th className="px-4 py-3 font-medium">Emp Code</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Mobile Number</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {rows.map((e, idx) => (
                    <motion.tr
                      key={e._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-slate-400">{(page - 1) * 10 + idx + 1}</td>
                      <td className="px-4 py-3 text-white">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-medium">
                            {(e.fullName?.[0] || e.firstName?.[0] || '?').toUpperCase()}
                          </div>
                          {e.fullName || `${e.firstName || ''} ${e.lastName || ''}`}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-300">{e.username || '—'}</td>
                      <td className="px-4 py-3 text-slate-400">{e.employeeCode || '—'}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-slate-800 text-slate-300 rounded text-xs">
                          {e.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{e.employeeType?.replace('_', ' ') || '—'}</td>
                      <td className="px-4 py-3 text-slate-400">{e.phone || '—'}</td>
                      <td className="px-4 py-3 text-slate-400">{e.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          e.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' :
                          e.status === 'SUSPENDED' ? 'bg-orange-500/10 text-orange-400' :
                          'bg-red-500/10 text-red-400'
                        }`}>
                          {e.status || (e.isActive ? 'ACTIVE' : 'INACTIVE')}
                        </span>
                      </td>
                      <td className="px-4 py-3 flex justify-center">
                        <EmployeeTableActions 
                          employee={e} 
                          onEdit={() => handleEdit(e)} 
                          onView={() => handleView(e)} 
                          onRefresh={load} 
                        />
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-white/5 bg-slate-800/20">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 bg-slate-800 text-slate-300 rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-slate-400 text-sm">Page {page} of {totalPages}</span>
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 bg-slate-800 text-slate-300 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      <EmployeeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        employee={selectedEmployee} 
        onSuccess={() => { setIsModalOpen(false); load(); }} 
      />
    </div>
  );
}

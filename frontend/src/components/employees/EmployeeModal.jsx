import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import api from '../../lib/api';

const ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF', 'HR', 'CASHIER', 'STORE_ADMIN', 'VENDOR_ADMIN', 'TRANSACTION_ADMIN', 'STORE_MANAGER', 'WAREHOUSE_MANAGER', 'SALES_ASSOCIATE'];
const EMPLOYEE_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'PAYROLL', 'INTERN'];
const DEPARTMENTS = ['MANAGEMENT', 'SALES', 'WAREHOUSE', 'FINANCE', 'IT', 'HR'];
const STATUSES = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];

export default function EmployeeModal({ isOpen, onClose, employee, onSuccess }) {
  const isEdit = !!employee;

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      fullName: '',
      username: '',
      employeeCode: '',
      email: '',
      phone: '',
      role: 'STAFF',
      employeeType: 'FULL_TIME',
      contractorName: '',
      department: 'SALES',
      status: 'ACTIVE',
      password: '',
      confirmPassword: '',
    }
  });

  useEffect(() => {
    if (isOpen) {
      if (employee) {
        reset({
          ...employee,
          password: '',
          confirmPassword: '',
        });
      } else {
        reset({
          fullName: '',
          username: '',
          employeeCode: '',
          email: '',
          phone: '',
          role: 'STAFF',
          employeeType: 'FULL_TIME',
          contractorName: '',
          department: 'SALES',
          status: 'ACTIVE',
          password: '',
          confirmPassword: '',
        });
      }
    }
  }, [isOpen, employee, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    try {
      if (data.password !== data.confirmPassword) {
        alert("Passwords do not match!");
        return;
      }
      
      const payload = { ...data };
      if (!payload.password) {
        delete payload.password;
        delete payload.confirmPassword;
      }

      if (isEdit) {
        await api.put(`/employee/${employee._id}`, payload);
      } else {
        await api.post('/employee', payload);
      }
      onSuccess();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'An error occurred.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl my-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">
            {isEdit ? 'Edit Employee' : 'Create Employee'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Full Name *</label>
              <input
                {...register('fullName', { required: 'Full Name is required' })}
                className="w-full rounded-lg border border-white/10 bg-white/5 py-2 px-3 text-white placeholder-slate-500 focus:border-blue-500/50 focus:outline-none"
                placeholder="John Doe"
              />
              {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName.message}</p>}
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Username</label>
              <input
                {...register('username')}
                className="w-full rounded-lg border border-white/10 bg-white/5 py-2 px-3 text-white placeholder-slate-500 focus:border-blue-500/50 focus:outline-none"
                placeholder="johndoe123"
              />
            </div>

            {/* Employee Code */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Employee Code</label>
              <input
                {...register('employeeCode')}
                className="w-full rounded-lg border border-white/10 bg-white/5 py-2 px-3 text-white placeholder-slate-500 focus:border-blue-500/50 focus:outline-none"
                placeholder="EMP-001"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email *</label>
              <input
                type="email"
                {...register('email', { required: 'Email is required' })}
                className="w-full rounded-lg border border-white/10 bg-white/5 py-2 px-3 text-white placeholder-slate-500 focus:border-blue-500/50 focus:outline-none"
                placeholder="john@example.com"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Mobile Number *</label>
              <input
                {...register('phone', { required: 'Phone is required' })}
                className="w-full rounded-lg border border-white/10 bg-white/5 py-2 px-3 text-white placeholder-slate-500 focus:border-blue-500/50 focus:outline-none"
                placeholder="+1 234 567 890"
              />
              {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Password {isEdit ? '(leave blank to keep current)' : '*'}
              </label>
              <input
                type="password"
                {...register('password', { required: !isEdit ? 'Password is required' : false })}
                className="w-full rounded-lg border border-white/10 bg-white/5 py-2 px-3 text-white placeholder-slate-500 focus:border-blue-500/50 focus:outline-none"
                placeholder="••••••••"
              />
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Confirm Password</label>
              <input
                type="password"
                {...register('confirmPassword')}
                className="w-full rounded-lg border border-white/10 bg-white/5 py-2 px-3 text-white placeholder-slate-500 focus:border-blue-500/50 focus:outline-none"
                placeholder="••••••••"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Role *</label>
              <select
                {...register('role', { required: 'Role is required' })}
                className="w-full rounded-lg border border-white/10 bg-white/5 py-2 px-3 text-white focus:border-blue-500/50 focus:outline-none"
              >
                {ROLES.map(r => <option key={r} value={r} className="bg-slate-800">{r}</option>)}
              </select>
            </div>

            {/* Employee Type */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Employee Type</label>
              <select
                {...register('employeeType')}
                className="w-full rounded-lg border border-white/10 bg-white/5 py-2 px-3 text-white focus:border-blue-500/50 focus:outline-none"
              >
                {EMPLOYEE_TYPES.map(t => <option key={t} value={t} className="bg-slate-800">{t.replace('_', ' ')}</option>)}
              </select>
            </div>

            {/* Contractor Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Contractor Name (if applicable)</label>
              <input
                {...register('contractorName')}
                className="w-full rounded-lg border border-white/10 bg-white/5 py-2 px-3 text-white placeholder-slate-500 focus:border-blue-500/50 focus:outline-none"
                placeholder="Agency XYZ"
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Department</label>
              <select
                {...register('department')}
                className="w-full rounded-lg border border-white/10 bg-white/5 py-2 px-3 text-white focus:border-blue-500/50 focus:outline-none"
              >
                {DEPARTMENTS.map(d => <option key={d} value={d} className="bg-slate-800">{d}</option>)}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
              <select
                {...register('status')}
                className="w-full rounded-lg border border-white/10 bg-white/5 py-2 px-3 text-white focus:border-blue-500/50 focus:outline-none"
              >
                {STATUSES.map(s => <option key={s} value={s} className="bg-slate-800">{s}</option>)}
              </select>
            </div>

          </div>
          
          <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-white/10">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isSubmitting ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Employee')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

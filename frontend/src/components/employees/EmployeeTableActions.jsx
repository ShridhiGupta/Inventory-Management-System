import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Eye, Edit, Trash2, ShieldAlert, KeyRound } from 'lucide-react';
import api from '../../lib/api';

export default function EmployeeTableActions({ employee, onEdit, onView, onRefresh }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${employee.fullName || employee.username}?`)) {
      try {
        await api.delete(`/employee/${employee._id}`);
        onRefresh();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete employee.');
      }
    }
    setIsOpen(false);
  };

  const handleSuspend = async () => {
    try {
      await api.put(`/employee/${employee._id}`, { status: 'SUSPENDED' });
      onRefresh();
    } catch (err) {
      alert('Failed to suspend employee.');
    }
    setIsOpen(false);
  };

  const handleResetPassword = async () => {
    const newPassword = window.prompt("Enter new password for " + employee.fullName);
    if (newPassword) {
      try {
        await api.put(`/employee/${employee._id}`, { password: newPassword });
        alert('Password reset successfully.');
      } catch (err) {
        alert('Failed to reset password.');
      }
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
      >
        <MoreVertical className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-slate-800 ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1" role="menu" aria-orientation="vertical">
            <button
              onClick={() => { onView(); setIsOpen(false); }}
              className="flex items-center w-full px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white"
            >
              <Eye className="mr-3 h-4 w-4 text-slate-400" /> View
            </button>
            <button
              onClick={() => { onEdit(); setIsOpen(false); }}
              className="flex items-center w-full px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white"
            >
              <Edit className="mr-3 h-4 w-4 text-slate-400" /> Edit
            </button>
            <button
              onClick={handleSuspend}
              className="flex items-center w-full px-4 py-2 text-sm text-orange-400 hover:bg-slate-700 hover:text-orange-300"
            >
              <ShieldAlert className="mr-3 h-4 w-4 text-orange-400" /> Suspend
            </button>
            <button
              onClick={handleResetPassword}
              className="flex items-center w-full px-4 py-2 text-sm text-blue-400 hover:bg-slate-700 hover:text-blue-300"
            >
              <KeyRound className="mr-3 h-4 w-4 text-blue-400" /> Reset Password
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-slate-700 hover:text-red-300"
            >
              <Trash2 className="mr-3 h-4 w-4 text-red-400" /> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

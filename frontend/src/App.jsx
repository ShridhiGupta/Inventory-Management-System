import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Inventory from './pages/Inventory';
import Home from './pages/erp/Home';
import Catalog from './pages/erp/Catalog';
import Purchase from './pages/erp/Purchase';
import SalesOrders from './pages/erp/SalesOrders';
import Customers from './pages/erp/Customers';
import Employees from './pages/erp/Employees';
import Reports from './pages/erp/Reports';
import InventoryLocations from './pages/erp/InventoryLocations';
import EStore from './pages/erp/EStore';
import Khata from './pages/erp/Khata';
import IntegrationsHub from './pages/erp/IntegrationsHub';
import api from './lib/api';
import './index.css';

function normalizeUser(raw) {
  if (!raw) return null;
  const id = raw.id != null ? String(raw.id) : raw._id != null ? String(raw._id) : '';
  return { ...raw, id };
}

function App() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setAuthChecked(true);
      return;
    }

    let cancelled = false;
    api
      .get('/auth/profile')
      .then((res) => {
        if (cancelled) return;
        const u = res.data?.user;
        if (u) {
          setUser(normalizeUser(u));
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('token');
        }
      })
      .catch(() => {
        if (!cancelled) localStorage.removeItem('token');
      })
      .finally(() => {
        if (!cancelled) setAuthChecked(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleLoginSuccess = useCallback((profile) => {
    setUser(profile);
    setIsAuthenticated(true);
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      /* ignore */
    }
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold text-white">InventoryPro</h1>
          <p className="text-sm text-slate-400">Loading…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <Routes>
      <Route path="/" element={<AppLayout user={user} onLogout={handleLogout} />}>
        <Route index element={<Navigate to="/home" replace />} />

        <Route path="home" element={<Home user={user} />} />
        <Route path="catalog/*" element={<Catalog user={user} />} />
        <Route path="inventory" element={<Inventory user={user} />} />
        <Route path="inventory/locations" element={<InventoryLocations user={user} />} />
        <Route path="purchase" element={<Purchase user={user} />} />
        <Route path="sales-orders" element={<SalesOrders user={user} />} />
        <Route path="customers" element={<Customers user={user} />} />
        <Route path="employees" element={<Employees user={user} />} />
        <Route path="reports" element={<Reports user={user} />} />
        <Route path="settings" element={<Settings user={user} onProfileUpdate={setUser} />} />
        <Route path="estore" element={<EStore user={user} />} />
        <Route path="khata" element={<Khata user={user} />} />
        <Route path="integrations" element={<IntegrationsHub user={user} />} />

        {/* Legacy paths → ERP */}
        <Route path="dashboard" element={<Navigate to="/home" replace />} />
        <Route path="warehouse" element={<Navigate to="/inventory/locations" replace />} />
        <Route path="stores" element={<Navigate to="/inventory/locations" replace />} />
        <Route path="vendors" element={<Navigate to="/purchase" replace />} />
        <Route path="billing" element={<Navigate to="/sales-orders" replace />} />
        <Route path="transactions" element={<Navigate to="/sales-orders" replace />} />
        <Route path="analytics" element={<Navigate to="/reports" replace />} />

        <Route path="*" element={<Navigate to="/home" replace />} />
      </Route>
    </Routes>
  );
}

export default App;

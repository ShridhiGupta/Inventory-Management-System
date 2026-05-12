import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

/**
 * Shell with sidebar; child routes render in <Outlet />.
 * Required for reliable route ↔ view updates in React Router v7.
 */
export default function AppLayout({ user, onLogout }) {
  return (
    <div className="flex h-screen bg-slate-950">
      <Sidebar user={user} onLogout={onLogout} />
      <div className="min-h-0 flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}

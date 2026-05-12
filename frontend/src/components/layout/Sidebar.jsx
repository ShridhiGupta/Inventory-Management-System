import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  LayoutGrid,
  Package,
  ShoppingCart,
  ClipboardList,
  Users,
  UserCog,
  BarChart3,
  Settings,
  Globe,
  BookMarked,
  Plug,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { cn } from '../../lib/utils';

const menuItems = [
  { icon: Home, label: 'Home', href: '/home' },
  { icon: LayoutGrid, label: 'Catalog', href: '/catalog' },
  { icon: Package, label: 'Inventory', href: '/inventory' },
  { icon: ShoppingCart, label: 'Purchase', href: '/purchase' },
  { icon: ClipboardList, label: 'Sales order', href: '/sales-orders' },
  { icon: Users, label: 'Customer', href: '/customers' },
  { icon: UserCog, label: 'Employee', href: '/employees' },
  { icon: BarChart3, label: 'Reports', href: '/reports' },
  { icon: Settings, label: 'Settings', href: '/settings' },
  { icon: Globe, label: 'eStore', href: '/estore' },
  { icon: BookMarked, label: 'Khata', href: '/khata' },
  { icon: Plug, label: 'Integrations', href: '/integrations' }
];

const Sidebar = ({ user, onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const sidebarVariants = {
    expanded: { width: 280 },
    collapsed: { width: 80 }
  };

  const itemVariants = {
    expanded: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.2, delay: 0.1 }
    },
    collapsed: {
      x: -20,
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.div
      className="flex h-screen flex-col border-r border-white/10 bg-slate-900/50 backdrop-blur-xl"
      variants={sidebarVariants}
      animate={isCollapsed ? 'collapsed' : 'expanded'}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <div className="border-b border-white/10 p-4">
        <div className="flex items-center justify-between">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                variants={itemVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                className="flex items-center space-x-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">InventoryPro</h1>
                  <p className="text-xs text-gray-400">ERP · operations</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="rounded-lg p-2 transition-colors hover:bg-white/10"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <Menu className="h-5 w-5 text-gray-400" />
            ) : (
              <X className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.href === '/home'}
                className={({ isActive }) =>
                  cn(
                    'flex w-full items-center space-x-3 rounded-lg px-3 py-2 transition-all duration-200',
                    isActive
                      ? 'border border-blue-500/30 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  )
                }
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      variants={itemVariants}
                      initial="collapsed"
                      animate="expanded"
                      exit="collapsed"
                      className="text-sm font-medium"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavLink>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-white/10 p-4">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              variants={itemVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              className="space-y-3"
            >
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-blue-500">
                  <span className="text-sm font-bold text-white">
                    {user?.firstName?.[0] || 'U'}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="truncate text-xs text-gray-400">
                    {user?.role?.replace(/_/g, ' ')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="flex w-full items-center justify-center gap-2 rounded-lg p-2 transition-colors hover:bg-red-500/20"
                aria-label="Log out"
              >
                <LogOut className="h-4 w-4 text-red-400" />
                <span className="text-sm text-red-300">Log out</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        {isCollapsed && (
          <div className="flex flex-col items-center space-y-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-blue-500">
              <span className="text-sm font-bold text-white">
                {user?.firstName?.[0] || 'U'}
              </span>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-lg p-2 transition-colors hover:bg-red-500/20"
              aria-label="Log out"
            >
              <LogOut className="h-4 w-4 text-red-400" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Sidebar;

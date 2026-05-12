import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';
import NotificationBell from '../notifications/NotificationBell';

const Header = ({ title, user }) => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-16 bg-slate-900/30 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-6"
    >
      <div className="flex items-center space-x-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          <p className="text-gray-400 text-sm">Welcome back, {user?.firstName}</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className={cn(
              'w-64 pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg',
              'text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50',
              'focus:bg-white/10 transition-all duration-200'
            )}
          />
        </div>

        <NotificationBell />

        {/* User Menu */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">
              {user?.firstName?.[0] || 'U'}
            </span>
          </div>
          <div className="hidden md:block">
            <p className="text-white text-sm font-medium">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-gray-400 text-xs">
              {user?.role?.replace('_', ' ')}
            </p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/settings"
              className="flex rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Settings"
            >
              <Settings className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;

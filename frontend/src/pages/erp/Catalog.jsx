import React, { useState } from 'react';
import { Routes, Route, Navigate, NavLink, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Tags, 
  Package, 
  Settings2, 
  Receipt, 
  PercentCircle, 
  Menu,
  ChevronRight,
  Boxes
} from 'lucide-react';
import { cn } from '../../lib/utils';
import Header from '../../components/layout/Header';
import CatalogDashboard from '../../components/catalog/CatalogDashboard';
import BrandManagement from '../../components/catalog/classification/BrandManagement';
import CategoryManagement from '../../components/catalog/classification/CategoryManagement';
import ProductList from '../../components/catalog/products/ProductList';
import TaxManagement from '../../components/catalog/taxes/TaxManagement';
import ChargeManagement from '../../components/catalog/taxes/ChargeManagement';
import ComboManagement from '../../components/catalog/promotions/ComboManagement';
import MembershipManagement from '../../components/catalog/promotions/MembershipManagement';
import VoucherManagement from '../../components/catalog/promotions/VoucherManagement';

const catalogMenu = [
  { 
    title: 'Dashboard', 
    icon: LayoutDashboard, 
    path: 'dashboard' 
  },
  { 
    title: 'Classification', 
    icon: Tags,
    children: [
      { title: 'Category', path: 'categories' },
      { title: 'Brand', path: 'brands' }
    ]
  },
  { 
    title: 'Product Section', 
    icon: Package,
    children: [
      { title: 'Products', path: 'products' },
      { title: 'Product Groups', path: 'groups' },
      { title: 'Services', path: 'services' }
    ]
  },
  { 
    title: 'Taxes & Charges', 
    icon: Receipt,
    children: [
      { title: 'Taxes', path: 'taxes' },
      { title: 'Charges', path: 'charges' }
    ]
  },
  { 
    title: 'Pricing', 
    icon: Settings2,
    children: [
      { title: 'Store Allocation', path: 'pricing/store' }
    ]
  },
  { 
    title: 'Promotional', 
    icon: PercentCircle,
    children: [
      { title: 'Combos', path: 'combos' },
      { title: 'Memberships', path: 'memberships' },
      { title: 'Vouchers', path: 'vouchers' }
    ]
  }
];

function CatalogSidebar() {
  const [openSections, setOpenSections] = useState({
    'Classification': true,
    'Product Section': true
  });

  const toggleSection = (title) => {
    setOpenSections(prev => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <div className="w-64 flex-shrink-0 border-r border-white/10 bg-slate-900/50 hidden md:block overflow-y-auto min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-6">
        {catalogMenu.map((menu) => (
          <div key={menu.title}>
            {menu.children ? (
              <>
                <button 
                  onClick={() => toggleSection(menu.title)}
                  className="flex items-center justify-between w-full text-sm font-semibold text-slate-300 hover:text-white transition-colors mb-2"
                >
                  <div className="flex items-center gap-2">
                    <menu.icon className="h-4 w-4" />
                    {menu.title}
                  </div>
                  <ChevronRight className={cn(
                    "h-4 w-4 transition-transform duration-200", 
                    openSections[menu.title] ? "rotate-90" : ""
                  )} />
                </button>
                {openSections[menu.title] && (
                  <div className="pl-6 space-y-1">
                    {menu.children.map(child => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        className={({ isActive }) => cn(
                          "block px-3 py-2 text-sm rounded-lg transition-colors",
                          isActive 
                            ? "bg-blue-500/20 text-blue-400 font-medium" 
                            : "text-slate-400 hover:bg-white/5 hover:text-white"
                        )}
                      >
                        {child.title}
                      </NavLink>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <NavLink
                to={menu.path}
                className={({ isActive }) => cn(
                  "flex items-center gap-2 text-sm font-semibold px-3 py-2 rounded-lg transition-colors",
                  isActive 
                    ? "bg-blue-500/20 text-blue-400" 
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                )}
              >
                <menu.icon className="h-4 w-4" />
                {menu.title}
              </NavLink>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Catalog({ user }) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <Header title="Catalog Management" user={user} />
      
      <div className="flex flex-1 overflow-hidden">
        <CatalogSidebar />
        
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<CatalogDashboard />} />
            <Route path="brands" element={<BrandManagement />} />
            <Route path="categories" element={<CategoryManagement />} />
            <Route path="products" element={<ProductList />} />
            <Route path="taxes" element={<TaxManagement />} />
            <Route path="charges" element={<ChargeManagement />} />
            <Route path="combos" element={<ComboManagement />} />
            <Route path="memberships" element={<MembershipManagement />} />
            <Route path="vouchers" element={<VoucherManagement />} />
            
            {/* Placeholders for the rest to prevent 404s during development */}
            <Route path="*" element={
              <div className="p-8 flex flex-col items-center justify-center text-slate-400 h-full">
                <Boxes className="h-16 w-16 mb-4 opacity-50" />
                <h2 className="text-xl font-medium text-white mb-2">Module Under Construction</h2>
                <p>This section is currently being developed.</p>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </div>
  );
}

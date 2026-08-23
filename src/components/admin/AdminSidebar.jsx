import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingCart,
  Users,
  Store,
  Sparkles,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminSidebar({ isOpen, setIsOpen }) {
  const { logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Stock Control', path: '/admin/stock', icon: Boxes },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
    { name: 'Customers', path: '/admin/customers', icon: Users },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-slate-900 border-r border-slate-800 transition-transform duration-300 ease-in-out flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6 space-y-8">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-950/60">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <div>
              <span className="text-lg font-black text-white tracking-tight">
                APEX<span className="text-cyan-400">ADMIN</span>
              </span>
              <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Management Suite
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                      isActive
                        ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-md shadow-cyan-950/40'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                </NavLink>
              );
            })}
          </nav>

        </div>

        {/* Footer Quick Links */}
        <div className="p-6 border-t border-slate-800 space-y-3">
          <Link
            to="/"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-colors"
          >
            <Store className="w-4 h-4 text-emerald-400" />
            <span>Open Customer Store</span>
          </Link>

          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

import React from 'react';
import { Menu, Sun, Moon, LogOut } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useTheme } from '../context/ThemeContext';
import LiveSocketIndicator from './LiveSocketIndicator';

export default function AdminHeader({ setIsSidebarOpen }) {
  const { admin, logout } = useAdminAuth();
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <header className={`sticky top-0 z-30 h-20 backdrop-blur-xl border-b px-4 sm:px-8 flex items-center justify-between gap-4 transition-colors ${
      isDark ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white/90 border-slate-200 text-slate-900 shadow-sm'
    }`}>
      
      {/* Mobile Toggle & Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className={`lg:hidden p-2 rounded-xl ${
            isDark ? 'bg-slate-800 text-slate-300 hover:text-white' : 'bg-slate-100 text-slate-700 hover:text-slate-900'
          }`}
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            OG-Admin Console
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Live Socket Status Indicator */}
        <LiveSocketIndicator />

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-xl border transition-all ${
            isDark
              ? 'bg-slate-800 hover:bg-slate-750 text-amber-400 border-slate-700'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
          }`}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Admin Avatar */}
        <div className={`flex items-center gap-2 p-1.5 rounded-xl border ${
          isDark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-100 border-slate-200'
        }`}>
          <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
            {admin?.name?.charAt(0) || 'A'}
          </div>
          <span className={`text-xs font-bold hidden md:inline pr-2 ${
            isDark ? 'text-slate-200' : 'text-slate-800'
          }`}>
            {admin?.name || 'Administrator'}
          </span>
        </div>

        {/* Logout CTA */}
        <button
          onClick={logout}
          className="p-2 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}

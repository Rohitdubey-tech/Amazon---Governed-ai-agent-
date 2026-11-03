import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  Moon,
  Sun,
  RotateCcw,
  ChevronRight,
  LogOut,
  Search,
  UserCheck
} from 'lucide-react';
import { api } from '../../services/api';

export function Navbar({ onOpenSearch }) {
  const { user, switchRole, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleResetData = async () => {
    if (window.confirm("Reset all claims, tasks, policies, and demo data to clean initial state?")) {
      await api.resetStorage();
      window.location.reload();
    }
  };

  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path.includes('workspace')) return 'AI Agent Workspace';
    if (path.includes('claims')) return 'Expense Claims';
    if (path.includes('approvals')) return 'Human Approvals Queue';
    if (path.includes('policies')) return 'Policy Management';
    if (path.includes('audit')) return 'Security Audit Trail';
    if (path.includes('evaluation')) return '50-Benchmark Evaluation';
    if (path.includes('users')) return 'User Directory';
    if (path.includes('profile')) return 'Profile & RBAC';
    return 'Overview';
  };

  return (
    <header className="sticky top-0 z-30 bg-[#0A0D14]/90 backdrop-blur-md border-b border-[#1B212D] px-6 py-3.5 transition-colors">
      <div className="flex items-center justify-between">
        {/* Left: Breadcrumbs & Active Portal Indicator */}
        <div className="flex items-center gap-2.5 text-xs text-slate-400">
          <Link to="/dashboard" className="p-1 rounded-md bg-[#131824] text-slate-400 hover:text-white transition-colors">
            <Home className="w-3.5 h-3.5" />
          </Link>
          <span className="text-slate-500">Dashboards</span>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <span className="text-white font-semibold">{getBreadcrumb()}</span>
          <span className="text-slate-600">/</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider border ${
            user?.role === 'EMPLOYEE'
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
              : user?.role === 'MANAGER'
              ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
              : 'bg-[#ccff00]/15 text-[#ccff00] border-[#ccff00]/40'
          }`}>
            {user?.role === 'EMPLOYEE' ? 'EMPLOYEE PORTAL' : user?.role === 'MANAGER' ? 'MANAGER PORTAL' : 'ADMIN CONSOLE'}
          </span>
        </div>

        {/* Right: Actions, Search, Persona Switcher & Theme Button */}
        <div className="flex items-center gap-3">
          {/* Quick Search Shortcut */}
          {onOpenSearch && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenSearch}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#111722] border border-[#1E2738] text-xs text-slate-400 hover:text-white hover:border-[#ccff00]/40 transition-colors cursor-pointer"
              title="Global Search (⌘K)"
            >
              <Search className="w-3.5 h-3.5 text-[#ccff00]" />
              <span className="text-[11px]">Search...</span>
              <kbd className="px-1.5 py-0.2 rounded text-[10px] font-mono text-slate-400 bg-[#171E2A] border border-[#232D3F]">
                ⌘K
              </kbd>
            </motion.button>
          )}

          {/* User Profile Pill - Tapping opens Profile */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-[#111722] border border-[#1E2738] hover:border-[#ccff00]/40 transition-colors cursor-pointer text-xs"
            title="View User Profile of the Person"
          >
            <div className="w-5 h-5 rounded-full bg-[#ccff00] text-slate-950 font-black text-[10px] flex items-center justify-center">
              {user?.avatar || 'PS'}
            </div>
            <span className="hidden sm:inline font-bold text-slate-200">{user?.name}</span>
          </motion.div>

          {/* Quick Demo Role Switcher Capsule with Framer Motion spring */}
          <div className="flex items-center bg-[#111622] p-1 rounded-xl border border-[#1E2536] text-[11px]">
            <span className="text-slate-500 font-medium px-2 hidden sm:inline text-[10px]">Persona:</span>
            {(['EMPLOYEE', 'MANAGER', 'ADMIN']).map((r) => {
              const active = user?.role === r;
              return (
                <motion.button
                  key={r}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => switchRole(r)}
                  className={`px-2.5 py-0.5 rounded-lg font-bold transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#ccff00] text-slate-950 shadow-md shadow-[#ccff00]/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#182030]'
                  }`}
                  title={`Switch to ${r}`}
                >
                  {r}
                </motion.button>
              );
            })}
          </div>

          <div className="h-5 w-px bg-[#1D2433]" />

          {/* Icon buttons with theme toggle */}
          <div className="flex items-center gap-1.5 text-slate-400">
            {/* Factory State Reset */}
            <motion.button
              whileHover={{ rotate: 180 }}
              whileTap={{ scale: 0.85 }}
              transition={{ duration: 0.3 }}
              onClick={handleResetData}
              className="p-1.5 rounded-lg hover:bg-[#141A26] hover:text-slate-200 transition-colors cursor-pointer"
              title="Reset Demo Data to Initial State"
            >
              <RotateCcw className="w-4 h-4" />
            </motion.button>

            {/* Real Functioning Theme Change Button */}
            <motion.button
              whileHover={{ scale: 1.15, rotate: 20 }}
              whileTap={{ scale: 0.85 }}
              onClick={toggleTheme}
              className="p-1.5 rounded-lg hover:bg-[#141A26] transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            >
              {theme === 'dark' ? (
                <Moon className="w-4 h-4 text-[#ccff00]" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500" />
              )}
            </motion.button>

            <div className="h-4 w-px bg-[#1D2433] mx-1" />

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-white/5 hover:border-rose-500/20 transition-all cursor-pointer"
              title="Sign Out of Account"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden md:inline text-[11px]">Logout</span>
            </motion.button>
          </div>
        </div>
      </div>
    </header>
  );
}

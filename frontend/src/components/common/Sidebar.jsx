import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutGrid,
  Sparkles,
  Receipt,
  CheckSquare,
  ShieldCheck,
  History,
  BarChart3,
  Users,
  UserCheck,
  Search,
  Shield,
  LogOut
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  useEffect(() => {
    async function fetchPending() {
      try {
        const pending = await api.approvals.listPending();
        setPendingCount(pending.length);
      } catch (e) {
        // quiet
      }
    }
    fetchPending();
    const interval = setInterval(fetchPending, 4000);
    return () => clearInterval(interval);
  }, []);

  const dashboardItems = [
    { name: 'Overview', to: '/dashboard', icon: LayoutGrid },
    { name: 'AI Workspace', to: '/workspace', icon: Sparkles },
    { name: 'Expense Claims', to: '/claims', icon: Receipt },
    {
      name: 'Approvals',
      to: '/approvals',
      icon: CheckSquare,
      badge: pendingCount > 0 ? pendingCount : null
    },
    { name: 'Policies', to: '/policies', icon: ShieldCheck },
    { name: 'Audit Logs', to: '/audit-logs', icon: History },
    { name: '50-Benchmark', to: '/evaluations', icon: BarChart3 }
  ];

  const settingItems = [
    { name: 'User Directory', to: '/admin/users', icon: Users, adminOnly: true },
    { name: 'Profile & RBAC', to: '/profile', icon: UserCheck }
  ];

  return (
    <aside className="w-64 bg-[#0A0D14] text-slate-400 flex flex-col shrink-0 min-h-screen border-r border-[#1B212D]">
      {/* 1. User profile banner with smooth hover */}
      <div className="p-4 flex items-center justify-between border-b border-[#171D28]">
        <div className="flex items-center gap-3">
          <div className="relative">
            <motion.div 
              whileHover={{ scale: 1.08 }}
              className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-lime-400 text-slate-950 font-extrabold text-xs flex items-center justify-center ring-2 ring-[#ccff00]/30 cursor-pointer"
            >
              {user?.avatar || 'PS'}
            </motion.div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#ccff00] ring-2 ring-[#0A0D14] animate-neon-pulse" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-100 leading-tight truncate max-w-[110px]">
              {user?.name || 'Priya Sharma'}
            </div>
            <div className="text-[10px] text-slate-500 font-medium">
              {user?.role || 'EMPLOYEE'}
            </div>
          </div>
        </div>

        {/* Quick Sign Out Action */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleLogout}
          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </motion.button>
      </div>

      {/* 2. Search input */}
      <div className="p-3">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search..."
            readOnly
            className="w-full bg-[#121620] text-xs text-slate-300 placeholder-slate-500 pl-8 pr-8 py-2 rounded-xl border border-[#1E2433] focus:outline-none"
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-500 bg-[#1A202C] border border-[#262F40]">
            ⌘K
          </span>
        </div>
      </div>

      {/* 3. Navigation groups with smooth micro-interactions */}
      <nav className="flex-1 px-3 space-y-6 overflow-y-auto pt-2">
        {/* DASHBOARDS SECTION */}
        <div>
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Dashboards
          </div>
          <div className="space-y-1">
            {dashboardItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `group block rounded-xl transition-all duration-150 ${
                      isActive
                        ? 'bg-[#ccff00] text-slate-950 font-bold shadow-lg shadow-[#ccff00]/15'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-[#131824]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <motion.div
                      whileHover={{ x: isActive ? 0 : 3 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center justify-between px-3 py-2.5 text-xs font-semibold"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                          isActive
                            ? 'bg-slate-950 text-[#ccff00]'
                            : 'bg-[#ccff00]/20 text-[#ccff00] border border-[#ccff00]/30'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </motion.div>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* SETTINGS SECTION */}
        <div>
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Settings
          </div>
          <div className="space-y-1">
            {settingItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `group block rounded-xl transition-all duration-150 ${
                      isActive
                        ? 'bg-[#ccff00] text-slate-950 font-bold shadow-lg shadow-[#ccff00]/15'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-[#131824]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <motion.div
                      whileHover={{ x: isActive ? 0 : 3 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center justify-between px-3 py-2.5 text-xs font-semibold"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                        <span>{item.name}</span>
                      </div>
                      {item.adminOnly && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#171E2B] text-slate-400 border border-[#232D40]">
                          ADMIN
                        </span>
                      )}
                    </motion.div>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* ACCOUNT / LOGOUT */}
        <div className="pt-2 border-t border-[#171D28]">
          <motion.button
            type="button"
            whileHover={{ x: 3 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <LogOut className="w-4 h-4 text-slate-500 group-hover:text-rose-400 transition-colors" />
              <span>Sign Out</span>
            </div>
            <span className="text-[10px] text-slate-600 font-mono uppercase">Exit</span>
          </motion.button>
        </div>
      </nav>

      {/* 4. Bottom brand logo */}
      <motion.div 
        whileHover={{ scale: 1.02 }}
        className="p-4 border-t border-[#171D28] flex items-center gap-2.5 cursor-pointer"
      >
        <div className="w-7 h-7 rounded-lg bg-[#ccff00] flex items-center justify-center text-slate-950 font-black text-xs shadow-sm shadow-[#ccff00]/20">
          <Shield className="w-4 h-4" />
        </div>
        <div>
          <div className="text-xs font-bold text-slate-100 tracking-tight">AgentShield AI</div>
          <div className="text-[10px] text-slate-500">Governed Execution</div>
        </div>
      </motion.div>
    </aside>
  );
}

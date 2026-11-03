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
  LogOut,
  Lock
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export function Sidebar({ onOpenSearch }) {
  const { user, logout, switchRole } = useAuth();
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);

  const role = user?.role || 'EMPLOYEE';

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

  // Portal branding badge based on role
  const portalConfig = {
    EMPLOYEE: {
      label: 'EMPLOYEE PORTAL',
      badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      avatarRing: 'ring-emerald-400/50',
      tagline: 'Personal Claims & Limits'
    },
    MANAGER: {
      label: 'MANAGER PORTAL',
      badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      avatarRing: 'ring-amber-400/50',
      tagline: 'Team Approvals & Risk'
    },
    ADMIN: {
      label: 'ADMIN CONSOLE',
      badgeClass: 'bg-[#ccff00]/15 text-[#ccff00] border-[#ccff00]/40',
      avatarRing: 'ring-[#ccff00]/50',
      tagline: 'Enterprise Governance'
    }
  }[role] || {
    label: 'PORTAL',
    badgeClass: 'bg-slate-800 text-slate-300 border-white/10',
    avatarRing: 'ring-white/20',
    tagline: 'AgentShield AI'
  };

  // Role-tailored primary navigation
  const getNavItems = () => {
    if (role === 'EMPLOYEE') {
      return [
        { name: 'Overview', to: '/dashboard', icon: LayoutGrid, subtitle: 'My Portal' },
        { name: 'AI Workspace', to: '/workspace', icon: Sparkles, subtitle: 'Submit Claim' },
        { name: 'My Claims', to: '/claims', icon: Receipt },
        { name: 'Company Policies', to: '/policies', icon: ShieldCheck, subtitle: 'View Limits' },
      ];
    }
    if (role === 'MANAGER') {
      return [
        { name: 'Overview', to: '/dashboard', icon: LayoutGrid, subtitle: 'Manager Hub' },
        {
          name: 'Approvals Queue',
          to: '/approvals',
          icon: CheckSquare,
          badge: pendingCount > 0 ? pendingCount : null
        },
        { name: 'Team Claims', to: '/claims', icon: Receipt },
        { name: 'AI Workspace', to: '/workspace', icon: Sparkles },
        { name: 'Policy Rules', to: '/policies', icon: ShieldCheck },
      ];
    }
    // ADMIN has full access
    return [
      { name: 'Overview', to: '/dashboard', icon: LayoutGrid, subtitle: 'Admin Console' },
      { name: 'AI Workspace', to: '/workspace', icon: Sparkles },
      { name: 'Expense Claims', to: '/claims', icon: Receipt },
      {
        name: 'Approvals Queue',
        to: '/approvals',
        icon: CheckSquare,
        badge: pendingCount > 0 ? pendingCount : null
      },
      { name: 'Policy Engine', to: '/policies', icon: ShieldCheck },
      { name: 'Security Audit Logs', to: '/audit-logs', icon: History },
      { name: '50-Benchmark', to: '/evaluations', icon: BarChart3 }
    ];
  };

  // Role-tailored settings
  const getSettingItems = () => {
    if (role === 'ADMIN') {
      return [
        { name: 'User Directory', to: '/admin/users', icon: Users, adminOnly: true },
        { name: 'Profile & RBAC', to: '/profile', icon: UserCheck }
      ];
    }
    return [
      { name: 'Profile & RBAC', to: '/profile', icon: UserCheck }
    ];
  };

  // Clearance restricted items showing why lower roles cannot access them
  const getRestrictedItems = () => {
    if (role === 'EMPLOYEE') {
      return [
        { name: 'Approvals Queue', roleRequired: 'MANAGER', actionRole: 'MANAGER' },
        { name: 'Security Audit Logs', roleRequired: 'ADMIN', actionRole: 'ADMIN' },
        { name: '50-Benchmark', roleRequired: 'ADMIN', actionRole: 'ADMIN' },
        { name: 'User Directory', roleRequired: 'ADMIN', actionRole: 'ADMIN' },
      ];
    }
    if (role === 'MANAGER') {
      return [
        { name: 'Security Audit Logs', roleRequired: 'ADMIN', actionRole: 'ADMIN' },
        { name: '50-Benchmark', roleRequired: 'ADMIN', actionRole: 'ADMIN' },
        { name: 'User Directory', roleRequired: 'ADMIN', actionRole: 'ADMIN' },
      ];
    }
    return [];
  };

  const dashboardItems = getNavItems();
  const settingItems = getSettingItems();
  const restrictedItems = getRestrictedItems();

  return (
    <aside className="w-64 bg-[#0A0D14] text-slate-400 flex flex-col shrink-0 min-h-screen border-r border-[#1B212D]">
      {/* 1. User profile banner with Active Portal Badge */}
      <div 
        onClick={() => navigate('/profile')}
        className="p-4 flex flex-col gap-2.5 border-b border-[#171D28] cursor-pointer hover:bg-[#121622] transition-colors group select-none"
        title="View Profile of the Person & RBAC Permissions"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <motion.div 
                whileHover={{ scale: 1.08 }}
                className={`w-9 h-9 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 text-slate-100 font-extrabold text-xs flex items-center justify-center ring-2 ${portalConfig.avatarRing} transition-all`}
              >
                {user?.avatar || (role === 'ADMIN' ? 'AS' : role === 'MANAGER' ? 'VM' : 'PS')}
              </motion.div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#ccff00] ring-2 ring-[#0A0D14] animate-neon-pulse" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-100 group-hover:text-[#ccff00] transition-colors leading-tight truncate max-w-[110px]">
                {user?.name || (role === 'ADMIN' ? 'Ananya Sen' : role === 'MANAGER' ? 'Vikram Malhotra' : 'Priya Sharma')}
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
            onClick={(e) => {
              e.stopPropagation();
              handleLogout();
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Distinct Portal Tag Pill */}
        <div className="flex items-center justify-between pt-1">
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border tracking-wider ${portalConfig.badgeClass}`}>
            {portalConfig.label}
          </span>
          <span className="text-[9px] text-slate-500 font-mono">
            {portalConfig.tagline}
          </span>
        </div>
      </div>

      {/* 2. Search input - Tapping opens real functioning Search Modal */}
      <div className="p-3">
        <div
          onClick={onOpenSearch}
          className="relative cursor-pointer group"
          title="Search claims, policies, pages (⌘K)"
        >
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 group-hover:text-[#ccff00] transition-colors" />
          <input
            type="text"
            placeholder="Search..."
            readOnly
            onClick={onOpenSearch}
            className="w-full bg-[#121620] text-xs text-slate-300 placeholder-slate-500 pl-8 pr-8 py-2 rounded-xl border border-[#1E2433] group-hover:border-[#ccff00]/50 focus:outline-none cursor-pointer transition-colors"
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-500 bg-[#1A202C] border border-[#262F40] group-hover:border-[#ccff00]/40 group-hover:text-[#ccff00] transition-colors">
            ⌘K
          </span>
        </div>
      </div>

      {/* 3. Navigation groups tailored strictly to role */}
      <nav className="flex-1 px-3 space-y-5 overflow-y-auto pt-2">
        {/* ACTIVE DASHBOARDS SECTION */}
        <div>
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            <span>{role === 'EMPLOYEE' ? 'My Workspace' : role === 'MANAGER' ? 'Manager Actions' : 'Enterprise Tools'}</span>
            <span className="text-[9px] font-mono text-slate-600">{dashboardItems.length} active</span>
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
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
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

        {/* RESTRICTED SECTION (Explains RBAC boundaries) */}
        {restrictedItems.length > 0 && (
          <div>
            <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-slate-600" />
              <span>Clearance Restricted</span>
            </div>
            <div className="space-y-1 mt-1">
              {restrictedItems.map((item) => (
                <div
                  key={item.name}
                  onClick={() => switchRole(item.actionRole)}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-600 hover:text-slate-300 hover:bg-white/5 transition-all cursor-pointer group"
                  title={`Click to switch to ${item.actionRole} to access ${item.name}`}
                >
                  <div className="flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-slate-600 group-hover:text-amber-400 transition-colors" />
                    <span className="line-through decoration-slate-700 group-hover:no-underline">{item.name}</span>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-500 group-hover:text-amber-300 group-hover:border-amber-500/30 transition-colors">
                    {item.roleRequired}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

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
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all group cursor-pointer"
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
        onClick={() => navigate('/dashboard')}
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

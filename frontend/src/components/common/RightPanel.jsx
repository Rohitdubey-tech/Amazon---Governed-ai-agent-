import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  ShieldCheck,
  Phone,
  Activity,
  ArrowUpRight,
  ShieldAlert,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';

export function RightPanel() {
  const { user, switchRole } = useAuth();
  const navigate = useNavigate();
  const [recentLogs, setRecentLogs] = useState([]);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    async function loadPanelData() {
      try {
        const logs = await api.dashboard.getRecentActivity();
        setRecentLogs(logs.slice(0, 5));
        const sum = await api.dashboard.getSummary();
        setSummary(sum);
      } catch (e) {
        // quiet fallback
      }
    }
    loadPanelData();
    const interval = setInterval(loadPanelData, 4000);
    return () => clearInterval(interval);
  }, []);

  const notifications = [
    { title: `${summary?.totalTasks || 56} Tasks Orchestrated`, time: "Live sync", icon: CheckCircle2, color: "text-[#ccff00]" },
    { title: `${summary?.totalSpendApproved ? '₹' + summary.totalSpendApproved.toLocaleString('en-IN') : '₹18,700'} Disbursed`, time: "Simulated ledger", icon: ShieldCheck, color: "text-[#ccff00]" },
    { title: "0 Unauthorized Actions", time: "100% Fail-closed", icon: ShieldAlert, color: "text-emerald-400" },
    { title: `${summary?.pendingApprovals || 0} Pending Manager Reviews`, time: "Threshold limit", icon: Bell, color: "text-amber-400" }
  ];

  const defaultActivities = [
    { title: "Policy version bumped to v2.4", time: "24m ago", avatar: "AS", name: "Ananya Sen" },
    { title: "177 Rule checks verified", time: "45m ago", avatar: "VM", name: "Vikram Malhotra" },
    { title: "Receipt hash collision blocked", time: "1h ago", avatar: "GW", name: "Gateway Engine" },
    { title: "Agent proposed action SHA-256", time: "Oct 2, 2026", avatar: "PS", name: "Priya Sharma" }
  ];

  const managers = [
    { name: "Vikram Malhotra", role: "Engineering Lead", avatar: "VM", targetRole: "MANAGER", active: false },
    { name: "Ananya Sen", role: "InfoSec Administrator", avatar: "AS", targetRole: "ADMIN", active: false },
    { name: "Nathaniel Donovan", role: "Compliance Officer", avatar: "ND", targetRole: "MANAGER", active: true, highlighted: true },
    { name: "Elizabeth Wayne", role: "Finance Director", avatar: "EW", targetRole: "MANAGER", active: false }
  ];

  return (
    <aside className="w-80 bg-[#0E121B] border-l border-[#1D2330] p-5 hidden 2xl:flex flex-col gap-6 shrink-0 min-h-screen text-slate-300">
      {/* 1. Notifications Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Governance Telemetry</h4>
          <span className="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse" />
        </div>
        <div className="space-y-3">
          {notifications.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-start gap-3 text-xs">
                <div className="p-1 rounded-full bg-[#161D2A] border border-[#232C3E] mt-0.5">
                  <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-200">{item.title}</p>
                  <p className="text-[10px] text-slate-500">{item.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-[#1D2330]" />

      {/* 2. Live Activities Timeline Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Audit Feed</h4>
          <Link to="/audit-logs" className="text-[10px] text-[#ccff00] hover:underline font-mono">
            View All
          </Link>
        </div>
        <div className="relative pl-3 space-y-4 border-l border-[#1F2634]">
          {recentLogs.length > 0 ? (
            recentLogs.map((log) => {
              const actorInitials = log.actor?.replace('user:', '').substring(0, 2).toUpperCase() || 'AG';
              return (
                <div key={log.id} className="relative flex items-start gap-2.5 text-xs">
                  <div className="absolute -left-[17px] top-1 w-2 h-2 rounded-full bg-[#ccff00] border-2 border-[#0E121B]" />
                  <div className="w-6 h-6 rounded-full bg-[#1C2333] border border-[#2B354A] flex items-center justify-center text-[10px] font-bold text-slate-200 shrink-0">
                    {actorInitials}
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-300 leading-snug font-medium line-clamp-2">
                      {log.details || log.action}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                      <span>{log.governance_decision}</span>
                      <span>•</span>
                      <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            defaultActivities.map((act, i) => (
              <div key={i} className="relative flex items-start gap-2.5 text-xs">
                <div className="absolute -left-[17px] top-1 w-2 h-2 rounded-full bg-[#ccff00] border-2 border-[#0E121B]" />
                <div className="w-6 h-6 rounded-full bg-[#1C2333] border border-[#2B354A] flex items-center justify-center text-[10px] font-bold text-slate-200 shrink-0">
                  {act.avatar}
                </div>
                <div className="flex-1">
                  <p className="text-slate-300 leading-snug">{act.title}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{act.time}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="h-px bg-[#1D2330]" />

      {/* 3. Contacts & Persona Switchers */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Enterprise Authorities</h4>
          <button
            type="button"
            onClick={() => navigate('/admin/users')}
            className="text-[10px] text-[#ccff00] hover:underline font-mono cursor-pointer"
          >
            Directory
          </button>
        </div>
        <div className="space-y-1.5">
          {managers.map((mgr, i) => {
            if (mgr.highlighted) {
              return (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => switchRole(mgr.targetRole)}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-[#ccff00] text-slate-950 font-bold text-xs shadow-lg shadow-[#ccff00]/10 cursor-pointer"
                  title={`Click to adopt persona: ${mgr.name}`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-900 text-[#ccff00] flex items-center justify-center text-[10px] font-extrabold">
                      {mgr.avatar}
                    </div>
                    <div>
                      <div className="text-slate-950 leading-tight">{mgr.name}</div>
                      <div className="text-[10px] text-slate-800 font-medium">{mgr.role}</div>
                    </div>
                  </div>
                  <div className="p-1.5 rounded-full bg-slate-950 text-[#ccff00]">
                    <Phone className="w-3 h-3" />
                  </div>
                </motion.div>
              );
            }

            return (
              <motion.div
                key={i}
                whileHover={{ backgroundColor: '#141A26', x: 2 }}
                onClick={() => switchRole(mgr.targetRole)}
                className="flex items-center justify-between p-2 rounded-xl transition-colors text-xs cursor-pointer"
                title={`Click to switch to ${mgr.targetRole}`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#18202E] border border-[#252F42] flex items-center justify-center text-[10px] font-bold text-slate-300">
                    {mgr.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-200">{mgr.name}</div>
                    <div className="text-[10px] text-slate-500">{mgr.role}</div>
                  </div>
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#161D2A] text-slate-400 border border-[#222B3B]">
                  {mgr.targetRole}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

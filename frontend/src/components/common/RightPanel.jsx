import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Phone,
  MoreVertical,
  Activity,
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';

export function RightPanel() {
  const { user, switchRole } = useAuth();
  const [recentLogs, setRecentLogs] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);

  useEffect(() => {
    async function loadPanelData() {
      try {
        const logs = await api.dashboard.getRecentActivity();
        setRecentLogs(logs.slice(0, 4));
        const pending = await api.approvals.listPending();
        setPendingApprovals(pending);
      } catch (e) {
        // quiet fallback
      }
    }
    loadPanelData();
  }, []);

  const notifications = [
    { title: "56 Tasks completed", time: "2m ago", icon: CheckCircle2, color: "text-[#ccff00]" },
    { title: "132 Claims validated", time: "12m ago", icon: ShieldCheck, color: "text-[#ccff00]" },
    { title: "Zero unauthorized actions", time: "1h ago", icon: ShieldAlert, color: "text-emerald-400" },
    { title: "5 Unread gateway alerts", time: "Today, 11:30 PM", icon: Bell, color: "text-[#ccff00]" }
  ];

  const activities = [
    { title: "Policy version bumped to v2.4", time: "24m ago", avatar: "AS", name: "Ananya Sen" },
    { title: "177 Rule checks verified", time: "45m ago", avatar: "VM", name: "Vikram Malhotra" },
    { title: "Receipt hash collision blocked", time: "1h ago", avatar: "GW", name: "Gateway Engine" },
    { title: "Agent proposed action SHA-256", time: "Oct 2, 2026", avatar: "PS", name: "Priya Sharma" }
  ];

  const managers = [
    { name: "Vikram Malhotra", role: "Engineering Lead", avatar: "VM", active: false },
    { name: "Ananya Sen", role: "InfoSec Administrator", avatar: "AS", active: false },
    { name: "Nathaniel Donovan", role: "Compliance Officer", avatar: "ND", active: true, highlighted: true },
    { name: "Elizabeth Wayne", role: "Finance Director", avatar: "EW", active: false },
    { name: "Felicia Rospet", role: "Audit Supervisor", avatar: "FR", active: false }
  ];

  return (
    <aside className="w-80 bg-[#0E121B] border-l border-[#1D2330] p-5 hidden 2xl:flex flex-col gap-6 shrink-0 min-h-screen text-slate-300">
      {/* 1. Notifications Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Notifications</h4>
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

      {/* 2. Activities Timeline Section */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Activities</h4>
        <div className="relative pl-3 space-y-4 border-l border-[#1F2634]">
          {activities.map((act, i) => (
            <div key={i} className="relative flex items-start gap-2.5 text-xs">
              {/* Dot on line */}
              <div className="absolute -left-[17px] top-1 w-2 h-2 rounded-full bg-[#ccff00] border-2 border-[#0E121B]" />
              <div className="w-6 h-6 rounded-full bg-[#1C2333] border border-[#2B354A] flex items-center justify-center text-[10px] font-bold text-slate-200 shrink-0">
                {act.avatar}
              </div>
              <div className="flex-1">
                <p className="text-slate-300 leading-snug">{act.title}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{act.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px bg-[#1D2330]" />

      {/* 3. Contacts of your managers Section */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Contacts of your managers</h4>
          <MoreVertical className="w-3.5 h-3.5 text-slate-500" />
        </div>
        <div className="space-y-1.5">
          {managers.map((mgr, i) => {
            if (mgr.highlighted) {
              return (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded-2xl bg-[#ccff00] text-slate-950 font-bold text-xs shadow-lg shadow-[#ccff00]/10 transition-transform hover:scale-[1.02]"
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
                </div>
              );
            }

            return (
              <div
                key={i}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-[#141A26] transition-colors text-xs"
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
                <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}


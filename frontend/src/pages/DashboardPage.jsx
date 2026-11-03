import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MoreVertical,
  ChevronDown,
  ArrowUpRight,
  ShieldCheck,
  Download,
  RefreshCw,
  ExternalLink,
  FileText,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Receipt,
  UserCheck,
  Shield,
  Layers,
  ArrowRight,
  Send,
  Lock,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Check
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  LabelList
} from 'recharts';

export function DashboardPage() {
  const { user, switchRole } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const waveColor = isLight ? '#16a34a' : '#ccff00';
  const navigate = useNavigate();

  const role = user?.role || 'EMPLOYEE';

  const [summary, setSummary] = useState(null);
  const [claims, setClaims] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Admin View State
  const [timeRange, setTimeRange] = useState('Today');
  const [timeDropdownOpen, setTimeDropdownOpen] = useState(false);
  const [hoveredSlice, setHoveredSlice] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);

  // Employee Quick Prompt State
  const [quickPrompt, setQuickPrompt] = useState('');

  // Manager Quick Action State
  const [actionSuccess, setActionSuccess] = useState(null);

  // Close menus on outside click or Escape key
  useEffect(() => {
    const handleOutsideClick = () => {
      setActiveMenu(null);
      setTimeDropdownOpen(false);
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveMenu(null);
        setTimeDropdownOpen(false);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('click', handleOutsideClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const loadAllData = async () => {
    try {
      const [sum, claimsList, pendingList] = await Promise.all([
        api.dashboard.getSummary().catch(() => null),
        api.claims.list().catch(() => []),
        api.approvals.listPending().catch(() => [])
      ]);
      setSummary(sum);
      setClaims(claimsList);
      setPendingApprovals(pendingList);
    } catch (err) {
      console.error("Dashboard loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [role]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleManagerApprove = async (approvalId) => {
    try {
      await api.approvals.approve(approvalId, "Approved via Manager Dashboard quick action");
      setActionSuccess(`Authorization granted for claim.`);
      await loadAllData();
      setTimeout(() => setActionSuccess(null), 3500);
    } catch (e) {
      alert(e.message);
    }
  };

  const handleManagerReject = async (approvalId) => {
    const reason = prompt("Enter rejection reason for employee:", "Amount requires itemized tax breakdown");
    if (!reason) return;
    try {
      await api.approvals.reject(approvalId, reason);
      setActionSuccess(`Claim rejected with feedback sent to employee.`);
      await loadAllData();
      setTimeout(() => setActionSuccess(null), 3500);
    } catch (e) {
      alert(e.message);
    }
  };

  const exportCSV = (filename, headers, rows) => {
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Dynamic datasets for Admin Console
  const timeRangeData = {
    'Today': {
      metrics: {
        netRevenue: 128450,
        netRevenueTrend: '+2.4% vs yesterday',
        arr: 1498200,
        arrTrend: '+0.2% vs yesterday',
        goalPercent: 18,
        goalSubtitle: 'Goal $150k / Day',
        newOrders: 342,
        newOrdersTrend: '+8% vs yesterday',
        newCustomers: '014',
        newCustomersLabel: 'Today',
        grossProfit: '$4.2k',
        grossProfitTrend: '▲ +18% Daily Profit',
        totalProfit: '$18,420.50'
      },
      totalSales: 11520,
      centerVisits: { value: '14k', label: 'Daily Visits' },
      donutData: [
        { name: 'Electronic', value: 8240, color: '#ccff00' },
        { name: 'Furniture', value: 2180, color: '#22c55e' },
        { name: 'Clothes', value: 680, color: '#38bdf8' },
        { name: 'Shoes', value: 420, color: '#e2e8f0' }
      ],
      waveData: [
        { time: '9h', val: 18 },
        { time: '10h', val: 24 },
        { time: '11h', val: 36 },
        { time: '12h', val: 42 },
        { time: '13h', val: 38 },
        { time: '14h', val: 56 },
        { time: '15h', val: 64 },
        { time: '16h', val: 72 }
      ],
      customerList: [
        { name: 'Danny Liu', email: 'dannyliu@gmail.com', deals: '14', value: '$1,420', initials: 'DL', color: 'from-pink-500 to-rose-400' },
        { name: 'Bella Deviani', email: 'belladeviani@gmail.com', deals: '9', value: '$890', initials: 'BD', color: 'from-amber-500 to-orange-400' },
        { name: 'Darrell Steward', email: 'darrellsteward@gmail.com', deals: '6', value: '$640', initials: 'DS', color: 'from-emerald-500 to-teal-400' }
      ]
    },
    'This Week': {
      metrics: {
        netRevenue: 842190,
        netRevenueTrend: '+5.8% vs last week',
        arr: 1504800,
        arrTrend: '+1.8% vs last week',
        goalPercent: 45,
        goalSubtitle: 'Goal $900k / Wk',
        newOrders: 2840,
        newOrdersTrend: '+12% vs last week',
        newCustomers: '084',
        newCustomersLabel: 'This Week',
        grossProfit: '$25.6k',
        grossProfitTrend: '▲ +47% Weekly Profit',
        totalProfit: '$136,755.77'
      },
      totalSales: 71020,
      centerVisits: { value: '102k', label: 'Weekly Visits' },
      donutData: [
        { name: 'Electronic', value: 55640, color: '#ccff00' },
        { name: 'Furniture', value: 11420, color: '#22c55e' },
        { name: 'Clothes', value: 1840, color: '#38bdf8' },
        { name: 'Shoes', value: 2120, color: '#e2e8f0' }
      ],
      waveData: [
        { time: 'Mon', val: 32 },
        { time: 'Tue', val: 45 },
        { time: 'Wed', val: 40 },
        { time: 'Thu', val: 68 },
        { time: 'Fri', val: 55 },
        { time: 'Sat', val: 85 },
        { time: 'Sun', val: 95 }
      ],
      customerList: [
        { name: 'Danny Liu', email: 'dannyliu@gmail.com', deals: '1,023', value: '$37,431', initials: 'DL', color: 'from-pink-500 to-rose-400' },
        { name: 'Bella Deviani', email: 'belladeviani@gmail.com', deals: '963', value: '$30,423', initials: 'BD', color: 'from-amber-500 to-orange-400' },
        { name: 'Darrell Steward', email: 'darrellsteward@gmail.com', deals: '843', value: '$28,549', initials: 'DS', color: 'from-emerald-500 to-teal-400' }
      ]
    },
    'This Quarter': {
      metrics: {
        netRevenue: 3131021,
        netRevenueTrend: '+14.2% vs last quarter',
        arr: 1511121,
        arrTrend: '+32% vs last quarter',
        goalPercent: 71,
        goalSubtitle: 'Goal $2.1M / Qtr',
        newOrders: 18221,
        newOrdersTrend: '+11% vs last quarter',
        newCustomers: '412',
        newCustomersLabel: 'This Quarter',
        grossProfit: '$188.4k',
        grossProfitTrend: '▲ +34% Quarterly Profit',
        totalProfit: '$742,910.15'
      },
      totalSales: 348650,
      centerVisits: { value: '680k', label: 'Quarterly Visits' },
      donutData: [
        { name: 'Electronic', value: 245000, color: '#ccff00' },
        { name: 'Furniture', value: 68200, color: '#22c55e' },
        { name: 'Clothes', value: 21450, color: '#38bdf8' },
        { name: 'Shoes', value: 14000, color: '#e2e8f0' }
      ],
      waveData: [
        { time: 'W1', val: 120 },
        { time: 'W3', val: 185 },
        { time: 'W5', val: 240 },
        { time: 'W7', val: 310 },
        { time: 'W9', val: 420 },
        { time: 'W11', val: 580 },
        { time: 'W12', val: 742 }
      ],
      customerList: [
        { name: 'Danny Liu', email: 'dannyliu@gmail.com', deals: '4,891', value: '$184,230', initials: 'DL', color: 'from-pink-500 to-rose-400' },
        { name: 'Bella Deviani', email: 'belladeviani@gmail.com', deals: '3,412', value: '$142,500', initials: 'BD', color: 'from-amber-500 to-orange-400' },
        { name: 'Darrell Steward', email: 'darrellsteward@gmail.com', deals: '2,980', value: '$118,200', initials: 'DS', color: 'from-emerald-500 to-teal-400' }
      ]
    }
  };

  const activeTimeData = timeRangeData[timeRange] || timeRangeData['This Week'];

  return (
    <div className="space-y-6">
      {/* 1. TOP PORTAL SWITCHER & IDENTITY BANNER */}
      <div className="bg-gradient-to-r from-[#0E131F] via-[#101726] to-[#0A0E17] p-5 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black tracking-wider border ${
                role === 'EMPLOYEE'
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : role === 'MANAGER'
                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  : 'bg-[#ccff00]/15 text-[#ccff00] border-[#ccff00]/40'
              }`}>
                {role === 'EMPLOYEE' && '👤 EMPLOYEE REIMBURSEMENT PORTAL'}
                {role === 'MANAGER' && '👔 MANAGER GOVERNANCE & APPROVALS PORTAL'}
                {role === 'ADMIN' && '🛡️ EXECUTIVE ADMIN & SECURITY SUITE'}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Active User: <strong className="text-white">{user?.name}</strong>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {role === 'EMPLOYEE' && `Welcome back, ${user?.name || 'Priya'} 👋`}
              {role === 'MANAGER' && `Manager Governance Hub • ${user?.name || 'Vikram'} 👔`}
              {role === 'ADMIN' && `Executive Security & Financial Console • ${user?.name || 'Ananya'} 🛡️`}
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              {role === 'EMPLOYEE' && 'Submit personal corporate expense claims, upload receipts, review real-time AI agent verification, and monitor your ₹2,000 corporate autonomy limits.'}
              {role === 'MANAGER' && 'Review and authorize team claims exceeding employee autonomy limits, inspect cryptographic action hashes, and prevent unauthorized disbursements.'}
              {role === 'ADMIN' && 'Enterprise-wide financial telemetry, policy engine administration, zero unauthorized execution guarantees, and immutable SHA-256 cryptographic audit logs.'}
            </p>
          </div>

          {/* Quick 1-Click Persona Switcher */}
          <div className="flex flex-col items-start lg:items-end gap-2 bg-[#080B11]/80 p-3 rounded-2xl border border-white/5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Test Portal Persona:
            </span>
            <div className="flex items-center gap-1.5">
              {[
                { r: 'EMPLOYEE', label: '👤 Employee (Priya)', color: 'hover:border-emerald-500/50' },
                { r: 'MANAGER', label: '👔 Manager (Vikram)', color: 'hover:border-amber-500/50' },
                { r: 'ADMIN', label: '🛡️ Admin (Ananya)', color: 'hover:border-[#ccff00]/50' }
              ].map((p) => {
                const active = role === p.r;
                return (
                  <motion.button
                    key={p.r}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => switchRole(p.r)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      active
                        ? p.r === 'EMPLOYEE'
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                          : p.r === 'MANAGER'
                          ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md shadow-amber-400/20'
                          : 'bg-[#ccff00] text-slate-950 border-[#ccff00] shadow-md shadow-[#ccff00]/20'
                        : 'bg-[#121620] text-slate-300 border-white/10 hover:text-white ' + p.color
                    }`}
                  >
                    {p.label}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action notification banner */}
        {actionSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{actionSuccess}</span>
          </motion.div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. ROLE VIEW A: EMPLOYEE PORTAL VIEW                                      */}
      {/* ========================================================================= */}
      {role === 'EMPLOYEE' && (
        <div className="space-y-6">
          {/* Employee KPI Telemetry Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="My Submitted Claims"
              value="₹18,700"
              trend="3 Claims total"
              trendUp={true}
              subtitle="All time corporate expenses"
              icon={Receipt}
            />
            <StatCard
              title="Reimbursed & Disbursed"
              value="₹4,500"
              trend="Paid out (IndiGo)"
              trendUp={true}
              subtitle="Direct deposit to payroll"
              icon={CheckCircle2}
            />
            <StatCard
              title="Pending Manager Review"
              value="₹14,200"
              trend="1 Claim (Apple Reseller)"
              trendUp={false}
              subtitle="Waiting for Manager sign-off"
              icon={Clock}
            />
            <StatCard
              title="Your Autonomy Limit"
              value="₹2,000"
              trend="Auto-approved instantly"
              trendUp={true}
              subtitle="Receipt proof mandatory"
              icon={ShieldCheck}
            />
          </div>

          {/* Quick AI Reimbursement Submission Launcher */}
          <div className="bg-[#0E131F] p-5 rounded-3xl border border-white/10 shadow-xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#ccff00]" />
                  <span>Submit Reimbursement with Governed AI Agent</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Type your expense details or attach a receipt. The 4-agent pipeline parses, checks policy limits, and evaluates automatically.
                </p>
              </div>
              <Link to="/workspace">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-4 py-2 rounded-xl bg-[#ccff00] text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#ccff00]/15 cursor-pointer"
                >
                  <span>Open Full AI Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </motion.button>
              </Link>
            </div>

            {/* Interactive Prompt launcher */}
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="e.g., Claim flight reimbursement for IndiGo Airlines ₹4,500 with receipt..."
                value={quickPrompt}
                onChange={(e) => setQuickPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && quickPrompt) {
                    navigate(`/workspace?prompt=${encodeURIComponent(quickPrompt)}`);
                  }
                }}
                className="flex-1 bg-[#090D15] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#ccff00]/60"
              />
              <button
                onClick={() => navigate(`/workspace${quickPrompt ? `?prompt=${encodeURIComponent(quickPrompt)}` : ''}`)}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-[#ccff00]" />
                <span>Launch Agent</span>
              </button>
            </div>

            {/* Quick Prompt Suggestion Chips */}
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-white/5">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Quick Demo Presets:</span>
              {[
                "Uber to client office ₹1,850 (Under ₹2,000 threshold)",
                "Apple Monitor Dock ₹14,200 (Requires Manager Approval)",
                "Team dinner at Trishna Seafood ₹3,400"
              ].map((preset) => (
                <button
                  key={preset}
                  onClick={() => navigate(`/workspace?prompt=${encodeURIComponent(preset)}`)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 transition-colors cursor-pointer"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Two-Column Layout: My Recent Claims + Policy Rules */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: My Claims Table (2 cols) */}
            <div className="lg:col-span-2 bg-[#0E131F] rounded-3xl border border-white/10 p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-emerald-400" />
                    <span>My Recent Expense Claims</span>
                  </h3>
                  <p className="text-xs text-slate-400">Claims submitted under your profile ({user?.name || 'Priya Sharma'})</p>
                </div>
                <Link to="/claims" className="text-xs text-[#ccff00] hover:underline font-semibold flex items-center gap-1">
                  <span>View All Claims</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                      <th className="py-2.5 px-3">Merchant</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Verdict</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {claims.slice(0, 4).map((c) => (
                      <tr key={c.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-bold text-white">{c.merchant}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{c.id} • {c.date}</div>
                        </td>
                        <td className="py-3 px-3 text-slate-300">{c.category}</td>
                        <td className="py-3 px-3 font-mono font-bold text-white">₹{Number(c.amount).toLocaleString()}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            c.governance_decision === 'ALLOW'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : c.governance_decision === 'REQUIRE_APPROVAL'
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          }`}>
                            {c.governance_decision}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-[11px] text-slate-300 font-medium">
                            {c.status === 'PROCESSED' ? '✅ Paid' : c.status === 'WAITING_FOR_APPROVAL' ? '⏳ Under Review' : '❌ Blocked'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Link
                            to={`/claims/${c.id}`}
                            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 text-[11px] font-semibold transition-colors"
                          >
                            Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right: Policy Guidelines & Spending Breakdown (1 col) */}
            <div className="space-y-4">
              {/* Policy Rules applied to Employee */}
              <div className="bg-[#0E131F] rounded-3xl border border-white/10 p-5 shadow-xl">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-4 h-4 text-[#ccff00]" />
                  <span>Rules Applied To You</span>
                </h3>
                <div className="space-y-2.5 text-xs">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <div className="font-bold text-emerald-300">₹2,000 Auto-Approval Limit</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Claims ≤ ₹2,000 with receipt are approved without manager waiting time.</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <div className="font-bold text-amber-300">Claims &gt; ₹2,000 Require Manager</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Automatically paused at fail-closed boundary until Vikram Malhotra reviews.</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-white/5">
                    <div className="font-bold text-slate-200">Receipt Proof Mandatory</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Must attach valid PDF invoice or photo receipt.</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                    <div className="font-bold text-rose-300">Prohibited Categories</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Gaming, Luxury, Personal, Crypto are strictly auto-blocked.</div>
                  </div>
                </div>
              </div>

              {/* Category spend bar */}
              <div className="bg-[#0E131F] rounded-3xl border border-white/10 p-5 shadow-xl">
                <h3 className="text-sm font-bold text-white mb-3">My Spend by Category</h3>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Hardware & Equipment</span>
                      <span className="font-bold text-white">₹14,200 (76%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: '76%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Travel</span>
                      <span className="font-bold text-white">₹4,500 (24%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full" style={{ width: '24%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. ROLE VIEW B: MANAGER GOVERNANCE & APPROVALS PORTAL                     */}
      {/* ========================================================================= */}
      {role === 'MANAGER' && (
        <div className="space-y-6">
          {/* Manager KPI Telemetry Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Pending Authorizations"
              value={`${pendingApprovals.length} Claims`}
              trend="Requires Manager Sign-off"
              trendUp={false}
              subtitle="Held at fail-closed boundary"
              icon={AlertTriangle}
            />
            <StatCard
              title="Capital Under Review"
              value="₹18,700"
              trend="Pending disbursement"
              trendUp={false}
              subtitle="Bound to SHA-256 action hash"
              icon={Lock}
            />
            <StatCard
              title="Team Disbursed This Month"
              value="₹84,200"
              trend="Within team budget"
              trendUp={true}
              subtitle="Engineering department"
              icon={CheckCircle2}
            />
            <StatCard
              title="Avg Approval Turnaround"
              value="1.8 Hours"
              trend="SLA compliance 98.4%"
              trendUp={true}
              subtitle="Fast-track decision SLA"
              icon={Clock}
            />
          </div>

          {/* Pending Authorizations Quick Action Queue */}
          <div className="bg-[#0E131F] rounded-3xl border border-white/10 p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Pending Authorizations Action Queue</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {pendingApprovals.length} Pending
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  1-Click authorization boundary. Actions are bound cryptographically to exact parameters.
                </p>
              </div>
              <Link to="/approvals" className="text-xs text-[#ccff00] hover:underline font-bold flex items-center gap-1">
                <span>Open Approvals Desk</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            {pendingApprovals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingApprovals.map((appr) => (
                  <div key={appr.id} className="bg-[#121724] border border-amber-500/30 rounded-2xl p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-xs font-bold text-white">{appr.merchant || 'Apple Authorized Reseller'}</div>
                        <div className="text-[11px] text-slate-400">
                          Submitted by <strong className="text-slate-200">{appr.requester_name || 'Priya Sharma'}</strong>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-mono font-black text-amber-400">
                          ₹{Number(appr.amount || 14200).toLocaleString()}
                        </div>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          {appr.category || 'Hardware'}
                        </span>
                      </div>
                    </div>

                    {/* Risk progress */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Risk Assessment Score</span>
                        <span className="font-bold text-amber-400">{appr.risk_score || 72}/100 (Medium Risk)</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${appr.risk_score || 72}%` }} />
                      </div>
                    </div>

                    {/* Action Hash */}
                    <div className="bg-[#090D15] p-2 rounded-lg font-mono text-[10px] text-slate-400 truncate flex items-center justify-between">
                      <span className="truncate">Hash: {appr.action_hash || '3c2b8f810e19...'}</span>
                      <span className="text-emerald-400 text-[9px] font-bold">Cryptographically Bound</span>
                    </div>

                    {/* Quick Approve / Reject Buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleManagerApprove(appr.id)}
                        className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-emerald-500/15"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>Authorize Claim</span>
                      </button>
                      <button
                        onClick={() => handleManagerReject(appr.id)}
                        className="flex-1 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-[#090D15] rounded-2xl border border-white/5">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <div className="text-sm font-bold text-white">Queue Clear: All Claims Authorized</div>
                <div className="text-xs text-slate-400 mt-1">There are no pending employee claims requiring manager sign-off right now.</div>
              </div>
            )}
          </div>

          {/* Two-Column Layout: Team Claims + Manager Authority Scope */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-[#0E131F] rounded-3xl border border-white/10 p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-amber-400" />
                  <span>Team Claims History</span>
                </h3>
                <span className="text-xs text-slate-400">Engineering Direct Reports</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 text-[10px] font-bold uppercase">
                      <th className="py-2.5 px-3">Employee</th>
                      <th className="py-2.5 px-3">Merchant</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Risk</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {claims.map((c) => (
                      <tr key={c.id} className="hover:bg-white/5">
                        <td className="py-3 px-3 font-medium text-white">{c.user_name || 'Priya Sharma'}</td>
                        <td className="py-3 px-3 text-slate-300">{c.merchant}</td>
                        <td className="py-3 px-3 font-mono font-bold text-white">₹{Number(c.amount).toLocaleString()}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            c.risk_level === 'LOW' ? 'text-emerald-400 bg-emerald-500/10' :
                            c.risk_level === 'MEDIUM' ? 'text-amber-400 bg-amber-500/10' :
                            'text-rose-400 bg-rose-500/10'
                          }`}>
                            {c.risk_level || 'LOW'} ({c.risk_score || 18})
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <Badge variant={c.status === 'PROCESSED' ? 'success' : c.status === 'WAITING_FOR_APPROVAL' ? 'warning' : 'danger'}>
                            {c.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right: Manager Approval Scope Card */}
            <div className="space-y-4">
              <div className="bg-[#0E131F] rounded-3xl border border-white/10 p-5 shadow-xl">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Manager Authority Scope</span>
                </h3>
                <div className="space-y-3 text-xs text-slate-300">
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <div className="font-bold text-amber-300">Authorization Limit: ₹25,000</div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      You are authorized to approve team claims up to ₹25,000. Claims exceeding ₹25,000 automatically escalate to Executive Admin.
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-white/5">
                    <div className="font-bold text-white">Cryptographic Hash Guarantee</div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Every approval signs a canonical SHA-256 payload. The simulated tool cannot execute with any modified parameter.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. ROLE VIEW C: ADMIN EXECUTIVE CONSOLE                                   */}
      {/* ========================================================================= */}
      {role === 'ADMIN' && (
        <div className="space-y-6">
          {/* Executive Governance KPI Telemetry */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Net Managed Volume"
              value={`$${activeTimeData.metrics.netRevenue.toLocaleString()}`}
              trend={activeTimeData.metrics.netRevenueTrend}
              trendUp={true}
              subtitle="Enterprise AI operations"
              icon={Receipt}
            />
            <StatCard
              title="Zero Unauthorized Executions"
              value="100% Guaranteed"
              trend="Fail-Closed Boundary"
              trendUp={true}
              subtitle="0 unauthorized disbursements"
              icon={ShieldCheck}
            />
            <StatCard
              title="Active Security Policies"
              value="4 Policies"
              trend="100% Policy Compliance"
              trendUp={true}
              subtitle="Deterministic rule engine"
              icon={Layers}
            />
            <StatCard
              title="Cryptographic Log Blocks"
              value="100% Chained"
              trend="SHA-256 immutability"
              trendUp={true}
              subtitle="Tamper-evident audit trail"
              icon={Lock}
            />
          </div>

          {/* Spline Wave Chart: Total Profit & Spend */}
          <div className="bg-[#0E131F] rounded-3xl border border-white/10 p-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Enterprise Capital & Profit Telemetry</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#ccff00]/15 text-[#ccff00] border border-[#ccff00]/30">
                    {timeRange}
                  </span>
                </h3>
                <p className="text-xs text-slate-400">Total Profit: <strong className="text-white">{activeTimeData.metrics.totalProfit}</strong> ({activeTimeData.metrics.grossProfitTrend})</p>
              </div>

              {/* Timeframe dropdown */}
              <div className="relative inline-block text-left">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setTimeDropdownOpen(prev => !prev);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#141A26] border border-white/10 text-xs font-bold text-white flex items-center gap-2 hover:border-[#ccff00]/50 transition-colors cursor-pointer"
                >
                  <span>{timeRange}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
                {timeDropdownOpen && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 mt-2 w-36 rounded-xl bg-[#121620] border border-white/10 shadow-2xl py-1 z-30"
                  >
                    {['Today', 'This Week', 'This Quarter'].map((tf) => (
                      <button
                        key={tf}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTimeRange(tf);
                          setTimeDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors ${
                          timeRange === tf ? 'bg-[#ccff00] text-slate-950 font-bold' : 'text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recharts Area Wave with numbers on every node */}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activeTimeData.waveData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="adminWaveGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={waveColor} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={waveColor} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0B0F17', borderColor: '#232D3F', borderRadius: '12px', fontSize: '11px' }}
                    labelStyle={{ color: '#94A3B8' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="val"
                    stroke={waveColor}
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#adminWaveGradient)"
                    dot={{ r: 3.5, fill: waveColor, stroke: '#0B0F17', strokeWidth: 1.5 }}
                    activeDot={{ r: 6, fill: '#ffffff', stroke: waveColor, strokeWidth: 2 }}
                  >
                    <LabelList
                      dataKey="val"
                      position="top"
                      offset={10}
                      fill={waveColor}
                      fontSize={11}
                      fontWeight="bold"
                    />
                  </Area>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom Grid: Donut + Recent System Claims */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Donut Chart (1 col) */}
            <div className="bg-[#0E131F] rounded-3xl border border-white/10 p-5 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-white">Sales & Merchant Overview</h3>
                <button
                  onClick={() => exportCSV('sales_overview.csv', ['Category', 'Value'], activeTimeData.donutData.map(d => [d.name, d.value]))}
                  className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
                  title="Export Sales CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0B0F17', borderColor: '#232D3F', borderRadius: '12px', fontSize: '11px' }}
                    />
                    <Pie
                      data={activeTimeData.donutData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                    >
                      {activeTimeData.donutData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-white/5 text-xs">
                {activeTimeData.donutData.map((d) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="text-slate-400 truncate">{d.name}</span>
                    <span className="text-white font-bold ml-auto">${d.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* System Claims Table (2 cols) */}
            <div className="lg:col-span-2 bg-[#0E131F] rounded-3xl border border-white/10 p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white">Enterprise Expense Ledger</h3>
                  <p className="text-xs text-slate-400">All claims governed by active policies</p>
                </div>
                <Link to="/claims" className="text-xs text-[#ccff00] hover:underline font-bold flex items-center gap-1">
                  <span>View All Claims</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 text-[10px] font-bold uppercase">
                      <th className="py-2.5 px-3">Claim ID</th>
                      <th className="py-2.5 px-3">Requester</th>
                      <th className="py-2.5 px-3">Merchant</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Verdict</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {claims.map((c) => (
                      <tr key={c.id} className="hover:bg-white/5">
                        <td className="py-3 px-3 font-mono text-slate-400">{c.id}</td>
                        <td className="py-3 px-3 text-white font-medium">{c.user_name}</td>
                        <td className="py-3 px-3 text-slate-300">{c.merchant}</td>
                        <td className="py-3 px-3 font-mono font-bold text-white">₹{Number(c.amount).toLocaleString()}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            c.governance_decision === 'ALLOW' ? 'text-emerald-400 bg-emerald-500/10' :
                            c.governance_decision === 'REQUIRE_APPROVAL' ? 'text-amber-400 bg-amber-500/10' :
                            'text-rose-400 bg-rose-500/10'
                          }`}>
                            {c.governance_decision}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <Badge variant={c.status === 'PROCESSED' ? 'success' : c.status === 'WAITING_FOR_APPROVAL' ? 'warning' : 'danger'}>
                            {c.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

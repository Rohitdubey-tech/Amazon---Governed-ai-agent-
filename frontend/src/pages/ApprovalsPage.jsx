import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckSquare,
  ShieldAlert,
  ShieldCheck,
  Shield,
  Hash,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Search,
  Filter,
  Clock,
  Copy,
  Check,
  FileText,
  AlertTriangle,
  RotateCcw,
  UserCheck,
  Zap
} from 'lucide-react';

export function ApprovalsPage() {
  const { user, switchRole } = useAuth();
  const navigate = useNavigate();
  const [approvals, setApprovals] = useState([]);
  const [activeTab, setActiveTab] = useState('PENDING'); // PENDING | HISTORY
  const [loading, setLoading] = useState(true);

  // Search, Filter & Sort
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL'); // ALL | HIGH | MEDIUM | LOW
  const [sortBy, setSortBy] = useState('newest'); // newest | amount_desc | risk_desc

  // Modal states
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [modalAction, setModalAction] = useState(null); // 'APPROVE' | 'REJECT'
  const [reasonInput, setReasonInput] = useState('');
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const isManagerOrAdmin = user?.role === 'MANAGER' || user?.role === 'ADMIN';

  const loadApprovals = async () => {
    try {
      const data = await api.approvals.listAll();
      setApprovals(data);
    } catch (err) {
      console.error("Failed to load approvals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApprovals();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyHash = (text, id) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    showToast("Cryptographic action hash copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenModal = (approval, action) => {
    setSelectedApproval(approval);
    setModalAction(action);
    setReasonInput(
      action === 'APPROVE'
        ? 'Verified authentic invoice & policy compliance. Approved for execution.'
        : 'Disallowed expenditure. Exceeds department discretionary budget.'
    );
    setErrorMsg(null);
  };

  const handleConfirmAction = async () => {
    if (!selectedApproval || !modalAction) return;

    setProcessing(true);
    setErrorMsg(null);

    try {
      if (modalAction === 'APPROVE') {
        await api.approvals.approve(selectedApproval.id, reasonInput);
        showToast(`Approval ${selectedApproval.id} authorized & cryptographically bound!`);
      } else {
        await api.approvals.reject(selectedApproval.id, reasonInput);
        showToast(`Action ${selectedApproval.id} rejected safely.`);
      }
      await loadApprovals();
      setSelectedApproval(null);
      setModalAction(null);
    } catch (err) {
      setErrorMsg(err.message || "Approval action failed");
    } finally {
      setProcessing(false);
    }
  };

  // Preset chips for instant justification
  const approvalPresets = [
    "Verified authentic vendor invoice & policy compliance. Approved.",
    "Quarterly engineering hardware budget verified. Authorized for execution.",
    "Manager exception authorized under discretionary threshold limit."
  ];

  const rejectionPresets = [
    "Disallowed category. Violates corporate expenditure guidelines.",
    "Exceeds departmental discretionary allocation for this quarter.",
    "Receipt documentation incomplete. Requires itemized tax breakdown."
  ];

  // Filtering & Sorting
  const pendingCount = approvals.filter(a => a.status === 'PENDING').length;
  const historyCount = approvals.filter(a => a.status !== 'PENDING').length;
  const pendingTotalCapital = approvals
    .filter(a => a.status === 'PENDING')
    .reduce((acc, cur) => acc + (cur.proposed_action?.amount || 0), 0);

  const filteredApprovals = approvals
    .filter((a) => (activeTab === 'PENDING' ? a.status === 'PENDING' : a.status !== 'PENDING'))
    .filter((a) => {
      if (riskFilter !== 'ALL' && a.risk_level !== riskFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        a.id?.toLowerCase().includes(q) ||
        a.proposed_action?.merchant?.toLowerCase().includes(q) ||
        a.requester_name?.toLowerCase().includes(q) ||
        a.requester_email?.toLowerCase().includes(q) ||
        a.claim_id?.toLowerCase().includes(q) ||
        a.action_hash?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'amount_desc') {
        return (b.proposed_action?.amount || 0) - (a.proposed_action?.amount || 0);
      }
      if (sortBy === 'risk_desc') {
        return (b.risk_score || 0) - (a.risk_score || 0);
      }
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-[#121620] border border-[#ccff00]/40 text-[#ccff00] text-xs font-mono px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 backdrop-blur-md"
          >
            <CheckCircle2 className="w-4 h-4 text-[#ccff00]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Header & Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1A2230] pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-white tracking-tight">
              Human-in-the-Loop Approvals
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#ccff00]/15 text-[#ccff00] border border-[#ccff00]/30 flex items-center gap-1">
              <Shield className="w-3 h-3 text-[#ccff00]" />
              <span>Exact-Action Binding Enforced</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            When deterministic policies flag high risk or threshold limits, multi-agent workflows pause. Authorized managers authorize exact cryptographic action hashes.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center bg-[#111622] p-1 rounded-xl border border-[#1E2536] text-xs font-bold shrink-0">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('PENDING')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'PENDING'
                ? 'bg-[#ccff00] text-slate-950 shadow-xs font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Queue</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'PENDING' ? 'bg-slate-950 text-[#ccff00]' : 'bg-[#18202D] text-slate-400'}`}>
              {pendingCount}
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('HISTORY')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'HISTORY'
                ? 'bg-[#ccff00] text-slate-950 shadow-xs font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Resolved History</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'HISTORY' ? 'bg-slate-950 text-[#ccff00]' : 'bg-[#18202D] text-slate-400'}`}>
              {historyCount}
            </span>
          </motion.button>
        </div>
      </div>

      {/* 2. Top Governance KPI Telemetry Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Requests */}
        <div className="bg-[#121620] rounded-2xl p-4 border border-[#1E2433] relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Pending Authorizations</span>
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-white font-mono mt-2">{pendingCount}</div>
          <div className="text-[10px] text-amber-400/90 mt-1 flex items-center gap-1 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span>Requires manager credential</span>
          </div>
        </div>

        {/* Capital Under Review */}
        <div className="bg-[#121620] rounded-2xl p-4 border border-[#1E2433] relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Capital Under Review</span>
            <span className="p-1.5 rounded-lg bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/20">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-[#ccff00] font-mono mt-2">
            ₹{pendingTotalCapital.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Threshold trigger limit: &gt; ₹5,000 INR
          </div>
        </div>

        {/* Action Binding Integrity */}
        <div className="bg-[#121620] rounded-2xl p-4 border border-[#1E2433] relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Cryptographic Binding</span>
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Hash className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-white font-mono mt-2">100%</div>
          <div className="text-[10px] text-cyan-400/90 mt-1">
            Payload SHA-256 pre-execution verified
          </div>
        </div>

        {/* Enforcement Policy */}
        <div className="bg-[#121620] rounded-2xl p-4 border border-[#1E2433] relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Governance Boundary</span>
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Zap className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-2">Fail-Closed</div>
          <div className="text-[10px] text-slate-400 mt-1">
            Zero direct agent execution authority
          </div>
        </div>
      </div>

      {/* 3. RBAC Interactive Notice (If logged in as EMPLOYEE) */}
      {!isManagerOrAdmin && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-gradient-to-r from-amber-950/40 via-[#181C26] to-[#121620] border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white text-sm">RBAC Authorization Gate Active: </span>
              <p className="text-slate-300 mt-0.5">
                Current persona: <strong className="text-amber-300">{user?.name} (EMPLOYEE)</strong>. Employees cannot approve governance requests. Switch persona to test manager authorization:
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                switchRole('MANAGER');
                showToast("Switched to Vikram Malhotra (MANAGER) persona!");
              }}
              className="px-3.5 py-2 rounded-xl bg-[#ccff00] text-slate-950 font-extrabold text-xs shrink-0 shadow-md shadow-[#ccff00]/15 cursor-pointer hover:bg-[#bbf000] transition-colors flex items-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Sign In as Manager (Vikram)</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                switchRole('ADMIN');
                showToast("Switched to Ananya Sen (ADMIN) persona!");
              }}
              className="px-3 py-2 rounded-xl border border-white/10 bg-[#161D2B] text-slate-200 font-bold text-xs shrink-0 hover:bg-[#1E2638] transition-colors"
            >
              Admin Persona
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* 4. Toolbar: Search, Risk Filter & Sorter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#121620] p-3 rounded-2xl border border-[#1E2433]">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by merchant, requester, claim ID, or hash..."
              className="w-full bg-[#0E121B] border border-[#1F2737] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#ccff00] transition-colors"
            />
          </div>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-xs text-slate-400 hover:text-white px-2 py-1"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Risk Level Pills */}
          <div className="flex items-center bg-[#0E121B] p-1 rounded-xl border border-[#1F2737] text-xs">
            <span className="text-[10px] text-slate-500 px-2 font-semibold uppercase">Risk:</span>
            {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((rf) => (
              <button
                key={rf}
                type="button"
                onClick={() => setRiskFilter(rf)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                  riskFilter === rf
                    ? 'bg-[#1D2636] text-[#ccff00] border border-[#ccff00]/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {rf}
              </button>
            ))}
          </div>

          {/* Sorter */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#0E121B] border border-[#1F2737] text-slate-300 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#ccff00] cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="amount_desc">Highest Amount</option>
            <option value="risk_desc">Highest Risk Score</option>
          </select>

          <button
            type="button"
            onClick={loadApprovals}
            title="Refresh Approvals"
            className="p-2 rounded-xl bg-[#0E121B] border border-[#1F2737] text-slate-400 hover:text-white hover:border-slate-600 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 5. Approvals List */}
      <div className="space-y-4">
        {filteredApprovals.length > 0 ? (
          filteredApprovals.map((appr) => {
            const isPending = appr.status === 'PENDING';
            const isApproved = appr.status === 'APPROVED';
            const isRejected = appr.status === 'REJECTED';
            const isHighRisk = (appr.risk_score || 0) >= 70;
            const isMedRisk = (appr.risk_score || 0) >= 30 && (appr.risk_score || 0) < 70;

            const riskBarColor = isHighRisk
              ? 'bg-rose-500'
              : isMedRisk
              ? 'bg-amber-400'
              : 'bg-emerald-400';

            return (
              <motion.div
                key={appr.id}
                whileHover={{ borderColor: '#2E3D59' }}
                className={`bg-[#121620] rounded-2xl border p-5 transition-all shadow-md ${
                  isPending
                    ? 'border-[#26334A] hover:border-[#ccff00]/40'
                    : isApproved
                    ? 'border-emerald-500/20'
                    : 'border-rose-500/20'
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#1A2230] pb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-black text-[#ccff00] bg-[#ccff00]/10 px-2 py-0.5 rounded-md border border-[#ccff00]/20">
                        {appr.id}
                      </span>
                      <Badge variant={appr.status}>{appr.status}</Badge>

                      <Link 
                        to={`/claims/${appr.claim_id}`}
                        className="text-xs text-slate-400 hover:text-[#ccff00] font-mono flex items-center gap-1 transition-colors group"
                      >
                        <span>Claim: {appr.claim_id}</span>
                        <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </Link>

                      <span className="text-slate-600">•</span>
                      <span className="text-[11px] text-slate-400">
                        Submitted: {new Date(appr.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    <h3 className="text-lg font-extrabold text-white mt-1.5 flex items-center gap-2">
                      <span>{appr.proposed_action?.merchant}</span>
                      <span className="text-sm font-bold text-[#ccff00] font-mono">
                        ₹{appr.proposed_action?.amount?.toLocaleString('en-IN')}{' '}
                        <span className="text-xs text-slate-400 font-sans font-normal">INR</span>
                      </span>
                      <span className="text-xs font-normal text-slate-400 bg-[#161D2B] px-2 py-0.5 rounded-lg border border-[#222B3B]">
                        {appr.proposed_action?.category}
                      </span>
                    </h3>
                  </div>

                  {/* Top Right Action & Resolution Info */}
                  <div className="flex items-center gap-3">
                    <Link
                      to={`/workspace/${appr.task_id}`}
                      className="px-3 py-1.5 rounded-xl border border-[#232D40] bg-[#161D2B] text-slate-300 hover:text-white font-semibold text-xs flex items-center gap-1.5 transition-colors hover:border-slate-600"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#ccff00]" />
                      <span>Inspect Plan</span>
                    </Link>

                    {isPending ? (
                      <div className="flex items-center gap-2">
                        <motion.button
                          disabled={!isManagerOrAdmin}
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => handleOpenModal(appr, 'REJECT')}
                          className="px-3.5 py-1.5 rounded-xl border border-rose-500/30 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 font-bold text-xs transition-colors disabled:opacity-40 cursor-pointer flex items-center gap-1"
                          title={!isManagerOrAdmin ? "Manager credentials required" : "Reject proposed action"}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </motion.button>

                        <motion.button
                          disabled={!isManagerOrAdmin}
                          whileHover={{ scale: 1.04, boxShadow: '0 0 25px rgba(204,255,0,0.35)' }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => handleOpenModal(appr, 'APPROVE')}
                          className="px-4 py-1.5 rounded-xl bg-[#ccff00] hover:bg-[#bbf000] text-slate-950 font-black text-xs shadow-lg shadow-[#ccff00]/15 transition-all flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
                          title={!isManagerOrAdmin ? "Manager credentials required" : "Authorize exact action"}
                        >
                          <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                          <span>Approve & Authorize</span>
                        </motion.button>
                      </div>
                    ) : (
                      <div className="text-right text-xs bg-[#161D2A] px-3 py-1.5 rounded-xl border border-[#232D40]">
                        <div className="text-slate-400">
                          {isApproved ? (
                            <span className="text-emerald-400 font-bold flex items-center gap-1 justify-end">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                            </span>
                          ) : (
                            <span className="text-rose-400 font-bold flex items-center gap-1 justify-end">
                              <XCircle className="w-3.5 h-3.5" /> Rejected
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-white font-medium mt-0.5">
                          by {appr.approver_name || 'Manager Authority'}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {new Date(appr.resolved_at || appr.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3-Column Detailed Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-xs">
                  {/* Column 1: Policy Rule & Requester */}
                  <div className="space-y-1.5">
                    <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-400" />
                      <span>Policy Rule Triggered:</span>
                    </p>
                    <div className="p-3 rounded-xl bg-[#161D28] text-amber-200 font-medium border border-[#222B3B] leading-relaxed">
                      {appr.trigger_rule}
                    </div>
                    <div className="text-slate-400 text-[11px] pt-1 flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-[#1F2738] flex items-center justify-center font-bold text-[10px] text-[#ccff00]">
                        {appr.requester_name?.substring(0, 2).toUpperCase() || 'EM'}
                      </div>
                      <span>
                        Requester: <strong className="text-white">{appr.requester_name}</strong> ({appr.requester_email})
                      </span>
                    </div>
                  </div>

                  {/* Column 2: Risk Assessment Meter & Factors */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3 text-rose-400" />
                        <span>Explainable Risk Meter:</span>
                      </p>
                      <Badge variant={appr.risk_level}>{appr.risk_score}/100 Risk</Badge>
                    </div>

                    {/* Visual Risk Progress Bar */}
                    <div className="w-full bg-[#0E121B] h-2 rounded-full overflow-hidden border border-white/5">
                      <div
                        className={`h-full ${riskBarColor} transition-all duration-500`}
                        style={{ width: `${Math.min(100, Math.max(10, appr.risk_score || 0))}%` }}
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-[#0E121B] border border-[#1A2230] text-[11px] text-slate-300 space-y-1.5">
                      {appr.risk_factors?.map((rf, idx) => (
                        <div key={idx} className="flex items-start gap-1.5">
                          <span className="text-[#ccff00] text-xs font-bold leading-none mt-0.5">•</span>
                          <span className="leading-tight">{rf}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Column 3: Cryptographic Hash & Token Bound */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                        <Hash className="w-3 h-3 text-[#ccff00]" />
                        <span>SHA-256 Action Bound:</span>
                      </p>
                      <button
                        type="button"
                        onClick={() => handleCopyHash(appr.action_hash, appr.id)}
                        className="text-[10px] text-slate-400 hover:text-[#ccff00] flex items-center gap-1 cursor-pointer font-mono"
                      >
                        {copiedId === appr.id ? (
                          <>
                            <Check className="w-3 h-3 text-[#ccff00]" />
                            <span className="text-[#ccff00]">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="p-2.5 bg-[#0A0D14] text-[#ccff00] rounded-xl font-mono text-[10px] break-all border border-[#18202E] select-all">
                      {appr.action_hash}
                    </div>

                    <div className="text-[10px] text-slate-500 space-y-0.5 pt-0.5">
                      <p>• Single-use token cryptographically bound to proposed tool payload.</p>
                      <p>• Execution engine verifies action hash prior to tool invocation.</p>
                    </div>
                  </div>
                </div>

                {/* Historical Resolution Notes */}
                {appr.approval_reason && (
                  <div className="mt-3.5 p-3 bg-[#0B1E14] rounded-xl border border-emerald-500/20 text-xs text-emerald-300 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white">Manager Approval Justification: </strong>
                      <span>{appr.approval_reason}</span>
                    </div>
                  </div>
                )}
                {appr.rejection_reason && (
                  <div className="mt-3.5 p-3 bg-rose-950/40 rounded-xl border border-rose-500/20 text-xs text-rose-300 flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white">Manager Rejection Grounds: </strong>
                      <span>{appr.rejection_reason}</span>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })
        ) : (
          <div className="bg-[#121620] rounded-2xl p-12 text-center border border-[#1E2536] space-y-3">
            <CheckSquare className="w-12 h-12 text-slate-600 mx-auto" />
            <div>
              <h3 className="text-base font-bold text-white">
                No {activeTab === 'PENDING' ? 'pending' : 'historical'} approval requests found
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                {searchQuery || riskFilter !== 'ALL'
                  ? 'No approvals match your current filter parameters. Try clearing the search or risk filter.'
                  : activeTab === 'PENDING'
                  ? 'All autonomous agent proposals have been evaluated and resolved.'
                  : 'No historical approvals recorded yet.'}
              </p>
            </div>
            {(searchQuery || riskFilter !== 'ALL') ? (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setRiskFilter('ALL'); }}
                className="px-4 py-2 bg-[#1A2232] hover:bg-[#222D42] text-slate-200 text-xs font-semibold rounded-xl border border-[#2B3850] transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/workspace')}
                className="px-4 py-2 bg-[#ccff00] text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Launch Autonomous Agent Task</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* 6. Confirmation Modal with Exact Payload Inspection & Presets */}
      <Modal
        isOpen={Boolean(selectedApproval)}
        onClose={() => setSelectedApproval(null)}
        title={modalAction === 'APPROVE' ? 'Authorize Cryptographic Action' : 'Reject Action Proposal'}
      >
        {selectedApproval && (
          <div className="space-y-4">
            <div className="p-3.5 bg-[#0A0E16] rounded-xl border border-[#1E2738] text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Merchant / Item:</span>
                <span className="font-bold text-white text-sm">{selectedApproval.proposed_action?.merchant}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Claimed Amount:</span>
                <span className="font-black font-mono text-[#ccff00] text-sm">
                  ₹{selectedApproval.proposed_action?.amount?.toLocaleString('en-IN')} INR
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Requester Persona:</span>
                <span className="text-slate-200 font-semibold">{selectedApproval.requester_name}</span>
              </div>
              <div className="pt-2 border-t border-[#1E2738]">
                <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                  <span>Exact Cryptographic Hash (SHA-256):</span>
                  <span className="text-cyan-400">Payload Immutable</span>
                </div>
                <p className="font-mono text-[10px] text-[#ccff00] bg-[#070A0F] p-2 rounded-lg break-all border border-[#18202E]">
                  {selectedApproval.action_hash}
                </p>
              </div>
            </div>

            {/* Quick 1-Click Justification Presets */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 block mb-1.5">
                Quick-Fill Justification Preset:
              </span>
              <div className="flex flex-col gap-1.5">
                {(modalAction === 'APPROVE' ? approvalPresets : rejectionPresets).map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setReasonInput(preset)}
                    className="text-left text-[11px] px-2.5 py-1.5 rounded-lg bg-[#0E121B] hover:bg-[#18202D] text-slate-300 hover:text-white border border-[#1F2737] transition-colors cursor-pointer truncate"
                  >
                    • {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Note Textarea */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                {modalAction === 'APPROVE' ? 'Manager Authorization Note' : 'Rejection Reason (Required)'}:
              </label>
              <textarea
                value={reasonInput}
                onChange={(e) => setReasonInput(e.target.value)}
                rows={2}
                className="w-full text-xs rounded-xl border border-[#232D40] bg-[#0A0E16] text-white p-2.5 focus:border-[#ccff00] focus:outline-none transition-colors"
                placeholder="Enter formal justification..."
              />
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-950/50 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-[#1A2230]">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={() => setSelectedApproval(null)}
                className="px-4 py-2 rounded-xl border border-[#253043] text-slate-300 text-xs font-semibold hover:bg-[#161E2D] cursor-pointer"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: modalAction === 'APPROVE' ? '0 0 25px rgba(204,255,0,0.35)' : '0 0 25px rgba(244,63,94,0.35)' }}
                whileTap={{ scale: 0.96 }}
                type="button"
                disabled={processing || !reasonInput.trim()}
                onClick={handleConfirmAction}
                className={`px-5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer disabled:opacity-40 flex items-center gap-1.5 ${
                  modalAction === 'APPROVE'
                    ? 'bg-[#ccff00] hover:bg-[#bbf000] text-slate-950 shadow-md shadow-[#ccff00]/20'
                    : 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-900/40'
                }`}
              >
                {processing ? (
                  <span>Processing...</span>
                ) : modalAction === 'APPROVE' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Authorize Execution</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    <span>Confirm Rejection</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

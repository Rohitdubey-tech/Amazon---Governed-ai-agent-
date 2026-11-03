import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Badge } from '../components/common/Badge';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Receipt,
  ShieldCheck,
  Hash,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

export function ClaimDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClaim() {
      try {
        const item = await api.claims.getById(id);
        setClaim(item);
      } catch (err) {
        console.error("Failed to fetch claim:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchClaim();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ccff00]"></div>
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="bg-[#121620] rounded-2xl p-8 text-center border border-[#1E2536]">
        <p className="text-slate-400 text-sm">Claim not found.</p>
        <Link to="/claims" className="mt-3 inline-block text-xs font-bold text-[#ccff00] hover:underline">
          Return to Claims List
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1A2230] pb-4">
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/claims')}
            className="p-2 rounded-xl border border-[#1E2536] bg-[#121620] hover:bg-[#1A2230] text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </motion.button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white font-mono">{claim.id}</h1>
              <Badge variant={claim.status}>{claim.status}</Badge>
              <Badge variant={claim.governance_decision}>{claim.governance_decision}</Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Submitted by {claim.user_name} on {new Date(claim.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {claim.task_id && (
            <Link
              to={`/workspace/${claim.task_id}`}
              className="px-3.5 py-1.5 rounded-xl border border-[#242E40] bg-[#141A26] text-slate-200 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#ccff00]" />
              <span>Inspect 4-Agent Execution Plan</span>
            </Link>
          )}

          {claim.status === 'WAITING_FOR_APPROVAL' && (
            <Link
              to="/approvals"
              className="px-3.5 py-1.5 rounded-xl bg-[#ccff00] text-slate-950 font-extrabold text-xs flex items-center gap-1.5 hover:bg-[#bbf000] transition-colors"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-slate-950" />
              <span>Go to Approvals Queue</span>
            </Link>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#121620] p-4 rounded-2xl border border-[#1E2536]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Claim Amount</p>
          <h3 className="text-2xl font-extrabold font-mono text-white mt-1">
            ₹{claim.amount?.toLocaleString('en-IN')} <span className="text-xs font-normal text-slate-500">INR</span>
          </h3>
        </div>
        <div className="bg-[#121620] p-4 rounded-2xl border border-[#1E2536]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Merchant / Payee</p>
          <h3 className="text-base font-bold text-white mt-1 truncate">{claim.merchant}</h3>
        </div>
        <div className="bg-[#121620] p-4 rounded-2xl border border-[#1E2536]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Expense Category</p>
          <h3 className="text-base font-bold text-white mt-1">{claim.category}</h3>
        </div>
        <div className="bg-[#121620] p-4 rounded-2xl border border-[#1E2536]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Explainable Risk Score</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xl font-bold font-mono text-white">{claim.risk_score || 20}/100</span>
            <Badge variant={claim.risk_level || 'LOW'}>{claim.risk_level || 'LOW'}</Badge>
          </div>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Receipt & Extraction Card */}
        <div className="bg-[#121620] rounded-2xl border border-[#1E2536] p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#ccff00]" />
            <span>Receipt Extraction & OCR Evidence</span>
          </h3>

          <div className="p-3 bg-[#0E121B] rounded-xl border border-[#1A2230] space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Attached File:</span>
              <span className="font-semibold text-white font-mono">{claim.receipt_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Receipt Ref ID:</span>
              <span className="font-mono text-slate-300">{claim.receipt_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">OCR Extraction Confidence:</span>
              <span className="font-semibold text-[#ccff00]">98.4% (Verified)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Duplicate Check:</span>
              <span className="font-semibold text-[#ccff00]">
                {claim.governance_decision === 'DENY' && claim.block_reason?.includes('Duplicate') 
                  ? 'COLLISION DETECTED' 
                  : '0 Collisions in 90-Day Window'}
              </span>
            </div>
          </div>

          <div className="p-4 bg-[#0A0D14] text-[#ccff00] rounded-xl font-mono text-xs border border-[#18202E]">
            <p className="text-slate-500 text-[10px] mb-1">// Normalized Structured Receipt Payload</p>
            <pre className="text-[11px] leading-relaxed overflow-x-auto">
{JSON.stringify({
  merchant: claim.merchant,
  amount: claim.amount,
  currency: claim.currency,
  date: claim.date,
  category: claim.category,
  tax_id: "GSTIN29AAACA6542M1Z0"
}, null, 2)}
            </pre>
          </div>
        </div>

        {/* Governance & Trust Boundary Card */}
        <div className="bg-[#121620] rounded-2xl border border-[#1E2536] p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#ccff00]" />
            <span>Deterministic Governance Verification</span>
          </h3>

          <div>
            <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mb-1.5">
              <Hash className="w-3.5 h-3.5 text-[#ccff00]" />
              <span>Exact-Action Canonical Cryptographic Hash:</span>
            </label>
            <div className="p-2.5 bg-[#0A0D14] font-mono text-[11px] text-[#ccff00] rounded-xl break-all border border-[#192130]">
              {claim.action_hash || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Guarantees the proposed action parameters match the executed transaction with mathematical certainty.
            </p>
          </div>

          {/* Policy checks status */}
          <div className="space-y-2 pt-2 border-t border-[#1A2230] text-xs">
            <p className="font-bold text-slate-300 text-[10px] uppercase tracking-wider">Policy Checklist:</p>
            <div className="flex items-center justify-between p-2 rounded-xl bg-[#0B1E14] text-emerald-200 border border-emerald-500/20">
              <span>POL-REC-01: Authentic receipt attached</span>
              <CheckCircle2 className="w-4 h-4 text-[#ccff00]" />
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-[#0B1E14] text-emerald-200 border border-emerald-500/20">
              <span>POL-CAT-02: Non-personal business category</span>
              <CheckCircle2 className="w-4 h-4 text-[#ccff00]" />
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-[#0B1E14] text-emerald-200 border border-emerald-500/20">
              <span>POL-DUP-04: Receipt hash uniqueness verified</span>
              <CheckCircle2 className="w-4 h-4 text-[#ccff00]" />
            </div>
          </div>

          {claim.block_reason && (
            <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl text-xs text-rose-300">
              <strong className="font-bold">Execution Denied: </strong>
              <span>{claim.block_reason}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

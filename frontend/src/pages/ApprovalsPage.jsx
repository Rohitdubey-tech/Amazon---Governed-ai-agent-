import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { motion } from 'framer-motion';
import {
  CheckSquare,
  ShieldAlert,
  Hash,
  CheckCircle2
} from 'lucide-react';

export function ApprovalsPage() {
  const { user } = useAuth();
  const [approvals, setApprovals] = useState([]);
  const [activeTab, setActiveTab] = useState('PENDING'); // PENDING | HISTORY
  const [loading, setLoading] = useState(true);

  // Modal states
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [modalAction, setModalAction] = useState(null); // 'APPROVE' | 'REJECT'
  const [reasonInput, setReasonInput] = useState('');
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

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

  const handleOpenModal = (approval, action) => {
    setSelectedApproval(approval);
    setModalAction(action);
    setReasonInput(
      action === 'APPROVE'
        ? 'Verified receipt against travel/equipment policy. Approved for processing.'
        : 'Disallowed expenditure. Exceeds department discretionary allocation.'
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
      } else {
        await api.approvals.reject(selectedApproval.id, reasonInput);
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

  const displayedApprovals = approvals.filter((a) =>
    activeTab === 'PENDING' ? a.status === 'PENDING' : a.status !== 'PENDING'
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1A2230] pb-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Human-in-the-Loop Approvals</span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#ccff00]/15 text-[#ccff00] border border-[#ccff00]/30">
              Exact-Action Binding Enforced
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            When deterministic policies trigger threshold limits, workflows pause. Authorized managers review exact proposed actions.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center bg-[#111622] p-1 rounded-xl border border-[#1E2536] text-xs font-bold self-start">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab('PENDING')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'PENDING'
                ? 'bg-[#ccff00] text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Pending Requests ({approvals.filter(a => a.status === 'PENDING').length})
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab('HISTORY')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'HISTORY'
                ? 'bg-[#ccff00] text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Resolved History ({approvals.filter(a => a.status !== 'PENDING').length})
          </motion.button>
        </div>
      </div>

      {/* RBAC Notice if user is EMPLOYEE */}
      {!isManagerOrAdmin && (
        <div className="p-4 bg-amber-950/30 border border-amber-500/30 rounded-2xl flex items-start gap-3 text-xs text-amber-200">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white">RBAC Permission Notice: </span>
            <span>
              Signed in as <strong>{user?.name} (EMPLOYEE)</strong>. Employees cannot approve governance requests.
              To test the approval flow, switch persona to <strong>MANAGER</strong> in the top header.
            </span>
          </div>
        </div>
      )}

      {/* Approvals List */}
      <div className="space-y-4">
        {displayedApprovals.length > 0 ? (
          displayedApprovals.map((appr) => {
            const isPending = appr.status === 'PENDING';
            return (
              <motion.div
                key={appr.id}
                whileHover={{ borderColor: '#2E3D59' }}
                className={`bg-[#121620] rounded-2xl border p-5 transition-colors ${
                  isPending ? 'border-[#26334A]' : 'border-[#1E2536]'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#1A2230] pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#ccff00]">{appr.id}</span>
                      <Badge variant={appr.status}>{appr.status}</Badge>
                      <span className="text-xs text-slate-500 font-mono">
                        Claim Ref: <strong className="text-slate-300">{appr.claim_id}</strong>
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white mt-1">
                      {appr.proposed_action?.merchant} • ₹{appr.proposed_action?.amount?.toLocaleString('en-IN')}{' '}
                      <span className="text-xs font-normal text-slate-400 font-sans">
                        ({appr.proposed_action?.category})
                      </span>
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    {isPending ? (
                      <div className="flex items-center gap-2">
                        <motion.button
                          disabled={!isManagerOrAdmin}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleOpenModal(appr, 'REJECT')}
                          className="px-3.5 py-1.5 rounded-xl border border-rose-500/30 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 font-bold text-xs transition-colors disabled:opacity-40 cursor-pointer"
                        >
                          Reject Action
                        </motion.button>
                        <motion.button
                          disabled={!isManagerOrAdmin}
                          whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(204,255,0,0.35)' }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleOpenModal(appr, 'APPROVE')}
                          className="px-4 py-1.5 rounded-xl bg-[#ccff00] hover:bg-[#bbf000] text-slate-950 font-extrabold text-xs shadow-lg shadow-[#ccff00]/15 transition-colors flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                          <span>Approve & Authorize</span>
                        </motion.button>
                      </div>
                    ) : (
                      <div className="text-right text-xs">
                        <span className="text-slate-500">Resolved by: </span>
                        <span className="font-bold text-white">{appr.approver_name || 'Manager'}</span>
                        <div className="text-[10px] text-slate-500">{new Date(appr.resolved_at || appr.created_at).toLocaleString()}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-xs">
                  {/* Trigger rule & requester */}
                  <div className="space-y-1.5">
                    <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                      Policy Rule Triggered:
                    </p>
                    <div className="p-2.5 rounded-xl bg-[#171D28] text-amber-200 font-medium border border-[#242D3E]">
                      {appr.trigger_rule}
                    </div>
                    <div className="text-slate-400 text-[11px] pt-1">
                      Requester: <strong className="text-white">{appr.requester_name}</strong> ({appr.requester_email})
                    </div>
                  </div>

                  {/* Risk Score */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                        Risk Assessment:
                      </p>
                      <Badge variant={appr.risk_level}>{appr.risk_score}/100 Risk</Badge>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#0E121B] border border-[#1A2230] text-[11px] text-slate-300 space-y-1">
                      {appr.risk_factors?.map((rf, idx) => (
                        <div key={idx} className="flex items-start gap-1">
                          <span className="text-[#ccff00]">•</span>
                          <span>{rf}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cryptographic Hash Binding */}
                  <div className="space-y-1.5">
                    <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                      <Hash className="w-3 h-3 text-[#ccff00]" />
                      <span>Action Cryptographic Hash (SHA-256):</span>
                    </p>
                    <div className="p-2.5 bg-[#0A0D14] text-[#ccff00] rounded-xl font-mono text-[10px] break-all border border-[#18202E]">
                      {appr.action_hash}
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Single-use token. Resumption re-evaluates policy and re-computes hash before execution.
                    </p>
                  </div>
                </div>

                {appr.approval_reason && (
                  <div className="mt-3 p-2.5 bg-[#0B1E14] rounded-xl border border-emerald-500/20 text-xs text-emerald-300">
                    <strong className="text-white">Manager Approval Note: </strong>
                    <span>{appr.approval_reason}</span>
                  </div>
                )}
                {appr.rejection_reason && (
                  <div className="mt-3 p-2.5 bg-rose-950/40 rounded-xl border border-rose-500/20 text-xs text-rose-300">
                    <strong className="text-white">Manager Rejection Reason: </strong>
                    <span>{appr.rejection_reason}</span>
                  </div>
                )}
              </motion.div>
            );
          })
        ) : (
          <div className="bg-[#121620] rounded-2xl p-12 text-center border border-[#1E2536]">
            <CheckSquare className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-white">No {activeTab.toLowerCase()} approvals</h3>
            <p className="text-xs text-slate-500 mt-1">
              {activeTab === 'PENDING'
                ? 'All pending agent requests have been evaluated.'
                : 'No historical approvals found.'}
            </p>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={Boolean(selectedApproval)}
        onClose={() => setSelectedApproval(null)}
        title={modalAction === 'APPROVE' ? 'Authorize Exact Proposed Action' : 'Reject Proposed Action'}
      >
        {selectedApproval && (
          <div className="space-y-4">
            <div className="p-3 bg-[#0A0E16] rounded-xl border border-[#1E2738] text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Merchant / Item:</span>
                <span className="font-bold text-white">{selectedApproval.proposed_action?.merchant}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount:</span>
                <span className="font-bold font-mono text-[#ccff00]">
                  ₹{selectedApproval.proposed_action?.amount?.toLocaleString('en-IN')} INR
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Requester:</span>
                <span className="text-slate-200">{selectedApproval.requester_name}</span>
              </div>
              <div className="pt-1 border-t border-[#1E2738]">
                <span className="text-slate-500 text-[10px]">Action Hash:</span>
                <p className="font-mono text-[10px] text-[#ccff00] break-all">{selectedApproval.action_hash}</p>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                {modalAction === 'APPROVE' ? 'Manager Approval Note' : 'Rejection Reason (Required)'}:
              </label>
              <textarea
                value={reasonInput}
                onChange={(e) => setReasonInput(e.target.value)}
                rows={2}
                className="w-full text-xs rounded-xl border border-[#232D40] bg-[#0A0E16] text-white p-2.5 focus:border-[#ccff00]"
              />
            </div>

            {errorMsg && (
              <div className="p-2.5 bg-rose-950/50 border border-rose-500/40 rounded-xl text-xs text-rose-300">
                {errorMsg}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => setSelectedApproval(null)}
                className="px-3.5 py-1.5 rounded-xl border border-[#253043] text-slate-300 text-xs font-semibold hover:bg-[#161E2D] cursor-pointer"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: modalAction === 'APPROVE' ? '0 0 20px rgba(204,255,0,0.3)' : '0 0 20px rgba(244,63,94,0.3)' }}
                whileTap={{ scale: 0.95 }}
                type="button"
                disabled={processing || !reasonInput.trim()}
                onClick={handleConfirmAction}
                className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  modalAction === 'APPROVE'
                    ? 'bg-[#ccff00] hover:bg-[#bbf000] text-slate-950'
                    : 'bg-rose-600 hover:bg-rose-500 text-white'
                }`}
              >
                {processing ? 'Processing...' : modalAction === 'APPROVE' ? 'Confirm Approval' : 'Confirm Rejection'}
              </motion.button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

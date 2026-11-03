import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import {
  ToggleLeft,
  ToggleRight,
  Edit2
} from 'lucide-react';

export function PoliciesPage() {
  const { user } = useAuth();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit threshold modal
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [newThreshold, setNewThreshold] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const isAdmin = user?.role === 'ADMIN';

  const loadPolicies = async () => {
    try {
      const data = await api.policies.list();
      setPolicies(data);
    } catch (err) {
      console.error("Failed to load policies:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPolicies();
  }, []);

  const handleToggle = async (policyId) => {
    try {
      await api.policies.toggle(policyId);
      await loadPolicies();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleOpenEdit = (pol) => {
    setEditingPolicy(pol);
    setNewThreshold(pol.threshold || 5000);
    setErrorMsg(null);
  };

  const handleSaveThreshold = async () => {
    if (!editingPolicy) return;
    const parsed = parseInt(newThreshold, 10);
    if (isNaN(parsed) || parsed < 0) {
      setErrorMsg("Please enter a valid numeric threshold.");
      return;
    }

    setSaving(true);
    setErrorMsg(null);
    try {
      await api.policies.updateThreshold(editingPolicy.id, parsed);
      await loadPolicies();
      setEditingPolicy(null);
    } catch (err) {
      setErrorMsg(err.message || "Failed to update policy");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1A2230] pb-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Deterministic Policy Engine</span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#ccff00]/15 text-[#ccff00] border border-[#ccff00]/30">
              Active Engine: v2.4
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Rules evaluated deterministically in pure application code. LLMs propose actions; policies decide validity.
          </p>
        </div>

        {!isAdmin && (
          <div className="text-xs text-amber-300 bg-amber-950/40 border border-amber-500/30 px-3 py-1.5 rounded-xl self-start">
            <strong>Read-Only Mode: </strong>
            <span>Switch to <strong>ADMIN</strong> in header to modify policies.</span>
          </div>
        )}
      </div>

      {/* Policy Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {policies.map((pol) => {
          const isActive = pol.active;
          const isThresholdRule = pol.rule_type === 'THRESHOLD_APPROVAL' || typeof pol.threshold === 'number';

          return (
            <div
              key={pol.id}
              className={`bg-[#121620] rounded-2xl border p-5 shadow-xs transition-all flex flex-col justify-between ${
                isActive ? 'border-[#1E2536] hover:border-[#2D384F]' : 'border-[#1A2230] opacity-50 bg-[#0E121B]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#ccff00] bg-[#172116] border border-[#23351E] px-2 py-0.5 rounded-lg">
                      {pol.policy_code}
                    </span>
                    <span className="text-xs font-mono text-slate-500 font-semibold">{pol.version}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={isActive ? 'ACTIVE' : 'INACTIVE'}>
                      {isActive ? 'ACTIVE' : 'INACTIVE'}
                    </Badge>
                    <button
                      disabled={!isAdmin}
                      onClick={() => handleToggle(pol.id)}
                      className="text-slate-500 hover:text-white disabled:opacity-40 transition-colors p-1"
                      title={isAdmin ? "Toggle Policy Active/Inactive" : "Admin required to toggle"}
                    >
                      {isActive ? (
                        <ToggleRight className="w-6 h-6 text-[#ccff00]" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-slate-600" />
                      )}
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white mt-1">{pol.name}</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{pol.description}</p>

                {/* Specific Rule Details */}
                <div className="mt-4 p-3 bg-[#0B0F17] rounded-xl border border-[#18202D] text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Enforcement Model:</span>
                    <span className="font-mono font-semibold text-white">{pol.enforcement}</span>
                  </div>

                  {typeof pol.threshold === 'number' && !isNaN(pol.threshold) && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Current Threshold:</span>
                      <span className="font-mono font-bold text-[#ccff00] bg-[#172214] px-2 py-0.5 rounded-lg border border-[#23381E]">
                        ₹{pol.threshold.toLocaleString('en-IN')} INR
                      </span>
                    </div>
                  )}

                  {Array.isArray(pol.prohibited_categories) && pol.prohibited_categories.length > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Restricted Terms:</span>
                      <span className="text-slate-200 font-semibold truncate max-w-[200px]">
                        {pol.prohibited_categories.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-[#1A2230] flex items-center justify-between text-[11px] text-slate-500">
                <span className="truncate">Updated by {pol.updated_by}</span>
                {isThresholdRule && (
                  <button
                    disabled={!isAdmin}
                    onClick={() => handleOpenEdit(pol)}
                    className="text-[#ccff00] font-bold hover:underline flex items-center gap-1 disabled:opacity-40 ml-2"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Configure Limit</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal to update threshold */}
      <Modal
        isOpen={Boolean(editingPolicy)}
        onClose={() => setEditingPolicy(null)}
        title="Configure Policy Threshold Limit"
      >
        {editingPolicy && (
          <div className="space-y-4">
            <p className="text-xs text-slate-400">
              Update the maximum monetary amount in INR that an autonomous agent can submit before triggering mandatory Manager approval.
            </p>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Threshold Amount (INR):
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-500">₹</span>
                <input
                  type="number"
                  value={newThreshold}
                  onChange={(e) => setNewThreshold(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-[#232D40] bg-[#0A0E16] text-white font-mono focus:border-[#ccff00]"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Standard demo baseline is ₹5,000. Changes will bump policy version and create an audit log.
              </p>
            </div>

            {errorMsg && (
              <div className="p-2.5 bg-rose-950/50 border border-rose-500/40 rounded-xl text-xs text-rose-300">
                {errorMsg}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingPolicy(null)}
                className="px-3.5 py-1.5 rounded-xl border border-[#253043] text-slate-300 text-xs font-semibold hover:bg-[#161E2D]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving || !newThreshold}
                onClick={handleSaveThreshold}
                className="px-4 py-1.5 rounded-xl bg-[#ccff00] hover:bg-[#bbf000] text-slate-950 text-xs font-extrabold transition-all"
              >
                {saving ? 'Saving...' : 'Save & Publish Version'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

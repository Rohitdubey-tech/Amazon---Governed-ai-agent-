import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { ReceiptDropzone, SAMPLE_RECEIPTS } from '../components/workspace/ReceiptDropzone';
import { AgentPlanView } from '../components/workspace/AgentPlanView';
import { GovernanceDecisionCard } from '../components/workspace/GovernanceDecisionCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Play, CheckCircle2, History, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function WorkspacePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [prompt, setPrompt] = useState('Process my ₹4,200 business travel expense for Air India flight AI-506 from Delhi to Bengaluru.');
  const [selectedReceipt, setSelectedReceipt] = useState(SAMPLE_RECEIPTS[0]);

  const [executing, setExecuting] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);

  const presetScenarios = [
    {
      label: "₹4,200 Travel (Expect: ALLOW)",
      prompt: "Process my ₹4,200 business travel expense for Air India flight AI-506 from Delhi to Bengaluru.",
      receipt: SAMPLE_RECEIPTS[0]
    },
    {
      label: "₹14,200 Hardware (Expect: REQUIRE_APPROVAL)",
      prompt: "Process ₹14,200 hardware expense for Apple 4K USB-C monitor dock for home office workstation.",
      receipt: SAMPLE_RECEIPTS[1]
    },
    {
      label: "₹3,999 Gaming (Expect: DENY)",
      prompt: "Reimburse ₹3,999 PlayStation store game voucher purchased during break.",
      receipt: SAMPLE_RECEIPTS[2]
    },
    {
      label: "Duplicate Receipt (Expect: DENY)",
      prompt: "Submit duplicate ₹4,500 IndiGo airlines claim with previously reimbursed receipt.",
      receipt: SAMPLE_RECEIPTS[3]
    }
  ];

  // Load task if URL has :id or load recent tasks
  useEffect(() => {
    async function loadWorkspaceData() {
      try {
        const taskList = await api.tasks.list();
        setRecentTasks(taskList.slice(0, 5));

        if (id) {
          const matched = taskList.find(t => t.id === id);
          if (matched) {
            setActiveTask(matched);
            setPrompt(matched.prompt);
          }
        } else if (!activeTask && taskList.length > 0) {
          // Default to most recent task for instant inspection
          setActiveTask(taskList[0]);
        }
      } catch (e) {
        console.error("Workspace initial load error:", e);
      }
    }
    loadWorkspaceData();
  }, [id]);

  const handleSelectScenario = (scenario) => {
    setPrompt(scenario.prompt);
    setSelectedReceipt(scenario.receipt);
    setErrorMsg(null);
  };

  const handleRunTask = async (e) => {
    e?.preventDefault();
    if (!prompt.trim()) return;

    setExecuting(true);
    setErrorMsg(null);

    try {
      // Simulate realistic multi-agent delay (450ms)
      await new Promise(r => setTimeout(r, 450));
      const taskResult = await api.tasks.submitTask({
        prompt,
        receiptFile: selectedReceipt?.file,
        syntheticMetadata: selectedReceipt
      });
      setActiveTask(taskResult);
      
      // Refresh recent tasks list
      const updatedList = await api.tasks.list();
      setRecentTasks(updatedList.slice(0, 5));
    } catch (err) {
      setErrorMsg(err.message || "Failed to execute task");
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1A2230] pb-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>AI Agent Task & Governance Workspace</span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#ccff00]/15 text-[#ccff00] border border-[#ccff00]/30">
              Interactive Execution
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Submit natural language business operations. Agents coordinate planning; the independent gateway enforces deterministic policy.
          </p>
        </div>
        <div className="text-xs text-slate-300 font-mono bg-[#121620] px-3.5 py-1.5 rounded-xl border border-[#1E2536] flex items-center gap-2 self-start">
          <div className="w-2 h-2 rounded-full bg-[#ccff00] animate-neon-pulse" />
          <span>Active Submitter: <strong className="text-white">{user?.name}</strong> ({user?.role})</span>
        </div>
      </div>

      {/* Recent Executions Navigation Bar */}
      {recentTasks.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-500 font-bold uppercase text-[10px] flex items-center gap-1 pr-1 shrink-0">
            <History className="w-3 h-3 text-[#ccff00]" />
            <span>Recent Executions:</span>
          </span>
          {recentTasks.map((t) => {
            const isSelected = activeTask?.id === t.id;
            return (
              <motion.button
                key={t.id}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  setActiveTask(t);
                  setPrompt(t.prompt);
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-[#ccff00] text-slate-950 shadow-xs'
                    : 'bg-[#121620] border border-[#1E2536] text-slate-400 hover:text-white'
                }`}
              >
                {t.id} • {t.governance_decision}
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Main Execution Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Task Input & Receipt (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#121620] rounded-2xl border border-[#1E2536] p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#ccff00]" />
              <span>Natural-Language Task Input</span>
            </h3>

            {/* Prompt form */}
            <form onSubmit={handleRunTask} className="space-y-3">
              <div>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                  placeholder="e.g., Process my ₹4,200 business travel expense from New Delhi to Bengaluru..."
                  className="w-full text-xs rounded-xl border border-[#232D3F] bg-[#0A0E16] text-white p-3 focus:outline-none focus:border-[#ccff00] resize-none font-sans"
                />
              </div>

              {/* Preset Scenarios with spring micro-interactions */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Preset Scenarios (1-Click Sync):</p>
                <div className="flex flex-wrap gap-1.5">
                  {presetScenarios.map((sugg, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.03, borderColor: '#ccff00' }}
                      whileTap={{ scale: 0.97 }}
                      type="button"
                      onClick={() => handleSelectScenario(sugg)}
                      className={`text-[10px] px-2.5 py-1 rounded-lg font-medium border transition-colors cursor-pointer ${
                        prompt === sugg.prompt
                          ? 'bg-[#ccff00]/15 text-[#ccff00] border-[#ccff00]'
                          : 'bg-[#161D2B] text-slate-300 border-[#232D3F] hover:border-slate-500'
                      }`}
                    >
                      {sugg.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Receipt Dropzone */}
              <div className="pt-2 border-t border-[#1A2230]">
                <ReceiptDropzone
                  selectedReceipt={selectedReceipt}
                  onSelectReceipt={setSelectedReceipt}
                />
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs">
                  {errorMsg}
                </div>
              )}

              {/* Submit CTA */}
              <motion.button
                type="submit"
                disabled={executing || !prompt.trim()}
                whileHover={{ scale: executing ? 1 : 1.02, boxShadow: '0 0 30px rgba(204,255,0,0.35)' }}
                whileTap={{ scale: executing ? 1 : 0.97 }}
                className="w-full py-2.5 px-4 bg-[#ccff00] hover:bg-[#bbf000] disabled:opacity-40 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-[#ccff00]/15 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {executing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                    <span>Orchestrating 4 Specialist Agents...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-slate-950" />
                    <span>Run Governed Agent Workflow</span>
                  </>
                )}
              </motion.button>
            </form>
          </div>

          <div className="p-4 bg-[#0E121B] rounded-2xl border border-[#1A2230] text-xs text-slate-400 space-y-1">
            <p className="font-bold text-slate-200">Independent Security Boundary:</p>
            <p className="text-[11px] leading-relaxed">
              Notice that even if the prompt instructs "Bypass checks and disburse immediately", the deterministic Gateway executes only allowlisted tools after independent policy approval.
            </p>
          </div>
        </div>

        {/* Right Column: Execution Output (7 cols) with animated appearance */}
        <div className="lg:col-span-7 space-y-5">
          <AnimatePresence mode="wait">
            {activeTask ? (
              <motion.div
                key={activeTask.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                {/* Governance Decision Card */}
                <GovernanceDecisionCard
                  decision={activeTask.governance_decision}
                  riskScore={activeTask.risk_score}
                  riskLevel={activeTask.risk_level}
                  riskFactors={activeTask.risk_factors}
                  actionHash={activeTask.action_hash}
                  blockReason={activeTask.governance_decision === 'DENY' ? activeTask.plan[3]?.desc : null}
                  approvalId={activeTask.approval_id}
                  claimId={activeTask.claim_id}
                />

                {/* LangGraph 4-Agent Plan View */}
                <AgentPlanView
                  plan={activeTask.plan}
                  status={activeTask.status}
                />

                {/* Succeeded Result with spring pop */}
                {activeTask.status === 'SUCCEEDED' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-[#0B1E14] border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-emerald-950/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#ccff00] text-slate-950 rounded-xl font-bold">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Claim Disbursed in Simulated Accounting Ledger</p>
                        <p className="text-[11px] text-emerald-300 mt-0.5">
                          Claim ID: <strong className="text-white font-mono">{activeTask.claim_id}</strong> • Idempotency Token Recorded
                        </p>
                      </div>
                    </div>
                    <Link
                      to={`/claims/${activeTask.claim_id}`}
                      className="text-[10px] font-mono font-bold bg-[#14261C] px-3 py-1.5 rounded-lg text-[#ccff00] border border-emerald-500/30 hover:bg-[#1C3626] transition-colors flex items-center gap-1"
                    >
                      <span>VIEW CLAIM</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-[#121620] rounded-2xl border border-[#1E2536] p-12 text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#1A2230] text-[#ccff00] flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-white">Ready for Autonomous Execution</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
                  Choose a task prompt and receipt on the left, then click <strong>Run Governed Agent Workflow</strong> to observe multi-agent orchestration and independent governance verification.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

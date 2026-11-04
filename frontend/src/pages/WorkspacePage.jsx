import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { ReceiptDropzone, SAMPLE_RECEIPTS } from '../components/workspace/ReceiptDropzone';
import { AgentPlanView } from '../components/workspace/AgentPlanView';
import { GovernanceDecisionCard } from '../components/workspace/GovernanceDecisionCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Play, CheckCircle2, History, ArrowRight, ShieldCheck, RefreshCw, Eye, Zap, Clock } from 'lucide-react';
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

  // Teacher Presentation Stepper state
  const [teacherFlowMode, setTeacherFlowMode] = useState(true);
  const [activeStep, setActiveStep] = useState(0); // 1 = Planner, 2 = Receipt OCR, 3 = Validation, 4 = Gateway
  const [executingMsg, setExecutingMsg] = useState('');

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

    // Initial placeholder task so right column immediately displays the visual workflow!
    const draftTask = {
      id: "tsk_live_evaluating",
      user_id: user?.id,
      user_name: user?.name,
      prompt,
      receipt_name: selectedReceipt?.name || "receipt.pdf",
      status: "EXECUTING",
      governance_decision: "EVALUATING",
      risk_score: 15,
      risk_level: "LOW",
      risk_factors: ["Multi-Agent workflow pipeline in progress..."],
      plan: [
        { step: 1, agent: "Planner Agent", desc: "Decomposing task intent and structuring subtasks with Gemini 3.5 Flash", status: "PENDING" },
        { step: 2, agent: "Receipt Agent", desc: "Scanning document OCR & extracting vendor, amount, category, tax ID", status: "PENDING" },
        { step: 3, agent: "Validation Agent", desc: "Validating parameter integrity, cross-referencing fields & duplicate check", status: "PENDING" },
        { step: 4, agent: "Execution Agent", desc: "Submitting proposed action to Governance Gateway for policy check & hash binding", status: "PENDING" }
      ]
    };
    setActiveTask(draftTask);

    try {
      if (teacherFlowMode) {
        // Step 1: Planner Agent
        setActiveStep(1);
        setExecutingMsg("🧠 Node 1 [Planner Agent]: Decomposing prompt with Gemini 3.5 Flash...");
        draftTask.plan[0].status = "EXECUTING";
        setActiveTask({ ...draftTask });
        await new Promise(r => setTimeout(r, 900));
        draftTask.plan[0].status = "COMPLETED";
        draftTask.plan[0].output = {
          intent: "EXPENSE_REIMBURSEMENT",
          extracted_amount: selectedReceipt?.amount || 4200,
          subtasks_count: 4
        };
        setActiveTask({ ...draftTask });

        // Step 2: Receipt OCR Agent
        setActiveStep(2);
        setExecutingMsg("📄 Node 2 [Receipt Agent]: Scanning document OCR, extracting merchant, amount & tax ID...");
        draftTask.plan[1].status = "EXECUTING";
        setActiveTask({ ...draftTask });
        await new Promise(r => setTimeout(r, 900));
        draftTask.plan[1].status = "COMPLETED";
        draftTask.plan[1].output = {
          merchant: selectedReceipt?.merchant || "Air India",
          amount: selectedReceipt?.amount || 4200,
          currency: "INR",
          confidence: 0.98,
          tax_id: "GSTIN07AABCI1234M1Z5"
        };
        setActiveTask({ ...draftTask });

        // Step 3: Validation Agent
        setActiveStep(3);
        setExecutingMsg("🔍 Node 3 [Validation Agent]: Validating parameters, format & duplicate claim hash check...");
        draftTask.plan[2].status = "EXECUTING";
        setActiveTask({ ...draftTask });
        await new Promise(r => setTimeout(r, 900));
        draftTask.plan[2].status = "COMPLETED";
        draftTask.plan[2].output = {
          mandatory_fields_present: true,
          duplicate_detected: prompt.toLowerCase().includes("duplicate"),
          category_classified: selectedReceipt?.category || "Travel"
        };
        setActiveTask({ ...draftTask });

        // Step 4: Governance Gateway
        setActiveStep(4);
        setExecutingMsg("🛡️ Node 4 [Governance Gateway]: Crossing Security Boundary — Evaluating policies & calculating SHA-256 hash...");
        draftTask.plan[3].status = "EXECUTING";
        setActiveTask({ ...draftTask });
        await new Promise(r => setTimeout(r, 900));
      } else {
        await new Promise(r => setTimeout(r, 300));
      }

      // Execute live backend task
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
      setActiveStep(0);
      setExecutingMsg('');
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

        {/* Presentation Mode Toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setTeacherFlowMode(!teacherFlowMode)}
            className={`text-xs px-3 py-1.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
              teacherFlowMode
                ? 'bg-[#ccff00]/15 border-[#ccff00] text-[#ccff00] font-bold shadow-md shadow-[#ccff00]/10'
                : 'bg-[#121620] border-[#1E2536] text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Teacher Live Flow: {teacherFlowMode ? "ON (Visual Stepper)" : "OFF (Instant)"}</span>
          </button>

          <div className="text-xs text-slate-300 font-mono bg-[#121620] px-3.5 py-1.5 rounded-xl border border-[#1E2536] flex items-center gap-2 self-start">
            <div className="w-2 h-2 rounded-full bg-[#ccff00] animate-neon-pulse" />
            <span>Active Submitter: <strong className="text-white">{user?.name}</strong> ({user?.role})</span>
          </div>
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
                    <span>Executing Step {activeStep} / 4 ({executingMsg ? "Active" : "Orchestrating"})...</span>
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

          {/* Teacher Guide Card */}
          <div className="p-4 bg-[#0E121B] rounded-2xl border border-[#1A2230] text-xs text-slate-400 space-y-2">
            <p className="font-bold text-white flex items-center gap-1.5">
              <span>🎓 What to Explain to Your Teacher:</span>
            </p>
            <ol className="text-[11px] leading-relaxed list-decimal pl-4 space-y-1 text-slate-300">
              <li><strong className="text-white">Node 1 (Planner):</strong> LLM uses Gemini 3.5 Flash to parse natural language intent.</li>
              <li><strong className="text-white">Node 2 (Receipt OCR):</strong> Multimodal AI extracts vendor, amount, date & tax ID.</li>
              <li><strong className="text-white">Node 3 (Validation):</strong> Validates format and checks 90-day duplicate ban.</li>
              <li><strong className="text-white">Node 4 (Gateway):</strong> Crosses the Trust Boundary. Computes SHA-256 hash and enforces deterministic policies.</li>
            </ol>
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
                {/* Governance Decision Card (shown when evaluated) */}
                {activeTask.governance_decision !== 'EVALUATING' && (
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
                )}

                {/* LangGraph 4-Agent Plan View with Live Stepper */}
                <AgentPlanView
                  plan={activeTask.plan}
                  status={activeTask.status}
                  activeStep={activeStep}
                  isExecuting={executing}
                  executingMessage={executingMsg}
                />

                {/* Human Approval Required Callout (HITL) */}
                {activeTask.status === 'WAITING_FOR_APPROVAL' && activeTask.approval_id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-[#241A0C] border border-amber-500/40 rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-amber-950/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-400 text-slate-950 rounded-xl font-bold">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Workflow Paused: Manager Review Required (HITL)</p>
                        <p className="text-[11px] text-amber-200 mt-0.5">
                          Amount exceeds ₹5,000 threshold. Cryptographic action hash bound to single-use token.
                        </p>
                      </div>
                    </div>
                    <Link
                      to="/approvals"
                      className="text-[10px] font-mono font-bold bg-[#33220E] px-3.5 py-2 rounded-xl text-amber-300 border border-amber-500/40 hover:bg-[#442E13] transition-colors flex items-center gap-1.5 shrink-0"
                    >
                      <span>GO TO APPROVALS</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </motion.div>
                )}

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

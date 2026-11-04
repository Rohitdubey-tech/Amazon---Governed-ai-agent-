import React from 'react';
import { Bot, CheckCircle, Clock, AlertTriangle, XCircle, Shield, ArrowRight, Zap, Play, Terminal } from 'lucide-react';
import { Badge } from '../common/Badge';
import { motion } from 'framer-motion';

export function AgentPlanView({
  plan = [],
  status,
  activeStep = 0, // 0 = idle/all done, 1 = Planner, 2 = Receipt, 3 = Validation, 4 = Governance
  isExecuting = false,
  executingMessage = ""
}) {
  const agentIcons = {
    "Planner Agent": Bot,
    "Receipt Agent": Bot,
    "Validation Agent": Bot,
    "Execution Agent": Shield
  };

  const agentNodes = [
    {
      step: 1,
      title: "Planner Agent",
      subtitle: "Gemini 3.5 Decomposition",
      icon: "🧠",
      layer: "Untrusted AI Agent"
    },
    {
      step: 2,
      title: "Receipt Agent",
      subtitle: "OCR / Document AI",
      icon: "📄",
      layer: "Untrusted AI Agent"
    },
    {
      step: 3,
      title: "Validation Agent",
      subtitle: "Duplicate & Format Check",
      icon: "🔍",
      layer: "Untrusted AI Agent"
    },
    {
      step: 4,
      title: "Governance Gateway",
      subtitle: "Deterministic Policy & Hash",
      icon: "🛡️",
      layer: "Zero-Trust Security Boundary"
    }
  ];

  const getStatusIcon = (stepStatus, isCurrentRunning) => {
    if (isCurrentRunning) {
      return (
        <span className="flex items-center gap-1.5 text-xs font-bold text-[#ccff00] font-mono">
          <span className="w-2 h-2 rounded-full bg-[#ccff00] animate-ping" />
          <span>EXECUTING...</span>
        </span>
      );
    }
    switch (stepStatus) {
      case 'COMPLETED':
        return (
          <span className="flex items-center gap-1 text-xs font-semibold text-[#ccff00]">
            <CheckCircle className="w-4 h-4 text-[#ccff00]" />
            <span>COMPLETED</span>
          </span>
        );
      case 'PAUSED':
        return (
          <span className="flex items-center gap-1 text-xs font-semibold text-amber-400">
            <Clock className="w-4 h-4 text-amber-400 animate-spin" />
            <span>PAUSED (HITL)</span>
          </span>
        );
      case 'FLAGGED':
        return (
          <span className="flex items-center gap-1 text-xs font-semibold text-amber-400">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>FLAGGED</span>
          </span>
        );
      case 'BLOCKED':
      case 'FAILED':
        return (
          <span className="flex items-center gap-1 text-xs font-semibold text-rose-400">
            <XCircle className="w-4 h-4 text-rose-400" />
            <span>BLOCKED</span>
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="flex items-center gap-1 text-xs font-semibold text-slate-500">
            <Clock className="w-4 h-4 text-slate-600" />
            <span>AWAITING TURN</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-[#121620] rounded-2xl border border-[#1E2536] p-5 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1A2230] pb-3">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <span>LangGraph Multi-Agent Orchestration Flow</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#18202D] text-[#ccff00] border border-[#232D40]">
              4 Sequential Nodes
            </span>
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Teacher Demo View: Watch how each specialist agent executes in sequence before crossing the Governance Boundary.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isExecuting && (
            <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-[#ccff00]/15 text-[#ccff00] border border-[#ccff00]/30 animate-pulse flex items-center gap-1.5">
              <Zap className="w-3 h-3 fill-[#ccff00]" />
              <span>Agent Step {activeStep} / 4 Active</span>
            </span>
          )}
          <Badge variant={status}>{status}</Badge>
        </div>
      </div>

      {/* Visual Agent Pipeline Diagram (Interactive Flow) */}
      <div className="p-4 bg-[#0A0D14] rounded-xl border border-[#1A2230]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Real-Time Pipeline Handover State:
          </span>
          <div className="flex items-center gap-3 text-[10px] font-mono">
            <span className="flex items-center gap-1 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-slate-600" /> Untrusted Agent Space
            </span>
            <span className="flex items-center gap-1 text-[#ccff00]">
              <span className="w-2 h-2 rounded-full bg-[#ccff00]" /> Governed Boundary
            </span>
          </div>
        </div>

        {/* The 4 Connected Node Boxes */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 relative">
          {agentNodes.map((node, i) => {
            const stepNum = i + 1;
            const isCurrentlyRunning = isExecuting && activeStep === stepNum;
            const isPastCompleted = (isExecuting && activeStep > stepNum) || (!isExecuting && plan[i]?.status === 'COMPLETED');
            const isBlockedOrPaused = !isExecuting && (plan[i]?.status === 'PAUSED' || plan[i]?.status === 'BLOCKED' || plan[i]?.status === 'FAILED');

            let borderStyle = "border-[#1E2638] bg-[#121620]";
            let textColor = "text-slate-400";
            if (isCurrentlyRunning) {
              borderStyle = "border-[#ccff00] bg-[#ccff00]/10 shadow-lg shadow-[#ccff00]/20 ring-1 ring-[#ccff00]";
              textColor = "text-white font-bold";
            } else if (isPastCompleted) {
              borderStyle = "border-emerald-500/50 bg-[#0C1F15]";
              textColor = "text-slate-200";
            } else if (isBlockedOrPaused) {
              borderStyle = plan[i]?.status === 'PAUSED' ? "border-amber-500/50 bg-[#241A0C]" : "border-rose-500/50 bg-[#220B10]";
              textColor = "text-slate-200";
            }

            return (
              <motion.div
                key={node.step}
                animate={isCurrentlyRunning ? { scale: [1, 1.02, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className={`p-3 rounded-xl border ${borderStyle} transition-all relative overflow-hidden`}
              >
                {/* Active neon glow pill */}
                {isCurrentlyRunning && (
                  <div className="absolute top-0 right-0 left-0 h-0.5 bg-gradient-to-r from-transparent via-[#ccff00] to-transparent animate-pulse" />
                )}

                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-base">{node.icon}</span>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                    isCurrentlyRunning ? 'bg-[#ccff00] text-slate-950 font-bold' : 'bg-[#18202D] text-slate-400'
                  }`}>
                    NODE {node.step}
                  </span>
                </div>

                <div className={`text-xs ${textColor} truncate`}>{node.title}</div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5">{node.subtitle}</div>

                {/* Node Status Pill */}
                <div className="mt-2 pt-2 border-t border-[#1C2433] flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-500">State:</span>
                  <span className={
                    isCurrentlyRunning ? 'text-[#ccff00] font-bold animate-pulse' :
                    isPastCompleted ? 'text-emerald-400 font-bold' :
                    isBlockedOrPaused ? 'text-amber-400 font-bold' : 'text-slate-500'
                  }>
                    {isCurrentlyRunning ? 'RUNNING' : isPastCompleted ? 'PASSED' : isBlockedOrPaused ? plan[i]?.status : 'AWAITING'}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Live Commentary Banner when executing */}
      {isExecuting && executingMessage && (
        <div className="p-3 bg-[#0E1520] border border-[#ccff00]/40 rounded-xl flex items-center gap-2.5 text-xs text-white">
          <div className="w-2 h-2 rounded-full bg-[#ccff00] animate-ping shrink-0" />
          <Terminal className="w-4 h-4 text-[#ccff00] shrink-0" />
          <span className="font-mono text-[11px] text-[#ccff00] truncate">
            {executingMessage}
          </span>
        </div>
      )}

      {/* Detailed Agent Step Execution Cards */}
      <div className="space-y-3">
        {plan.map((item, idx) => {
          const stepNum = idx + 1;
          const Icon = agentIcons[item.agent] || Bot;
          const isExecution = item.agent === "Execution Agent";
          const isCurrentRunning = isExecuting && activeStep === stepNum;
          const isPastOrDone = (!isExecuting && item.status !== 'PENDING') || (isExecuting && activeStep > stepNum);

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3.5 rounded-xl border transition-all ${
                isCurrentRunning
                  ? 'bg-[#141F1A] border-[#ccff00] shadow-md shadow-[#ccff00]/10 ring-1 ring-[#ccff00]/50'
                  : isExecution
                  ? 'bg-gradient-to-r from-[#112419] to-[#121822] border-emerald-500/30'
                  : 'bg-[#151C28] border-[#1E2738]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg ${
                    isCurrentRunning
                      ? 'bg-[#ccff00] text-slate-950 font-bold animate-pulse'
                      : isExecution
                      ? 'bg-[#ccff00] text-slate-950 font-bold'
                      : 'bg-[#1F2737] text-slate-300'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{item.agent}</span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 bg-[#0E121B] border border-[#20293A] rounded text-slate-400">
                        Step {item.step || stepNum}
                      </span>
                      {isExecution && (
                        <span className="text-[9px] font-bold uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                          Security Gateway
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {getStatusIcon(item.status, isCurrentRunning)}
                </div>
              </div>

              <p className="text-xs text-slate-300 mt-2 pl-8 leading-relaxed">
                {isCurrentRunning ? (
                  <span className="text-[#ccff00] font-mono animate-pulse">
                    Executing live operations... {item.desc}
                  </span>
                ) : (
                  item.desc
                )}
              </p>

              {/* Data payload output if completed */}
              {item.output && isPastOrDone && (
                <div className="mt-2.5 ml-8 p-2.5 bg-[#0A0D14] text-[#ccff00] rounded-xl text-[11px] font-mono border border-[#192130] overflow-x-auto">
                  <div className="text-[10px] text-slate-400 mb-1 flex items-center justify-between border-b border-[#1A2230] pb-1">
                    <span>Agent State Handover Output:</span>
                    <span className="text-[9px] text-[#ccff00]">JSON Validated</span>
                  </div>
                  <pre className="whitespace-pre-wrap">{JSON.stringify(item.output, null, 2)}</pre>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

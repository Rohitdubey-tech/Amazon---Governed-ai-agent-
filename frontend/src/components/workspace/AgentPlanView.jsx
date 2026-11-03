import React from 'react';
import { Bot, CheckCircle, Clock, AlertTriangle, XCircle, Shield } from 'lucide-react';
import { Badge } from '../common/Badge';

export function AgentPlanView({ plan = [], status }) {
  const agentIcons = {
    "Planner Agent": Bot,
    "Receipt Agent": Bot,
    "Validation Agent": Bot,
    "Execution Agent": Shield
  };

  const getStatusIcon = (stepStatus) => {
    switch (stepStatus) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-[#ccff00]" />;
      case 'PAUSED':
        return <Clock className="w-4 h-4 text-amber-400 animate-spin" />;
      case 'FLAGGED':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'BLOCKED':
      case 'FAILED':
        return <XCircle className="w-4 h-4 text-rose-400" />;
      default:
        return <Clock className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="bg-[#121620] rounded-2xl border border-[#1E2536] p-5 shadow-xs">
      <div className="flex items-center justify-between border-b border-[#1A2230] pb-3 mb-4">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <span>LangGraph Multi-Agent Team</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#18202D] text-[#ccff00] border border-[#232D40]">
              4 Orchestrated Nodes
            </span>
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Strict separation: Agents plan and extract. Only the Governance Gateway authorizes.
          </p>
        </div>
        <Badge variant={status}>{status}</Badge>
      </div>

      <div className="space-y-3">
        {plan.map((item, idx) => {
          const Icon = agentIcons[item.agent] || Bot;
          const isExecution = item.agent === "Execution Agent";

          return (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border transition-all ${
                isExecution
                  ? 'bg-gradient-to-r from-[#112419] to-[#121822] border-emerald-500/30'
                  : 'bg-[#151C28] border-[#1E2738]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg ${
                    isExecution ? 'bg-[#ccff00] text-slate-950 font-bold' : 'bg-[#1F2737] text-slate-300'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{item.agent}</span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 bg-[#0E121B] border border-[#20293A] rounded text-slate-400">
                        Step {item.step || idx + 1}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {getStatusIcon(item.status)}
                  <span className="text-xs font-semibold text-slate-300">{item.status}</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 mt-2 pl-8 leading-relaxed">
                {item.desc}
              </p>

              {item.output && (
                <div className="mt-2.5 ml-8 p-2.5 bg-[#0A0D14] text-[#ccff00] rounded-xl text-[11px] font-mono border border-[#192130] overflow-x-auto">
                  <pre className="whitespace-pre-wrap">{JSON.stringify(item.output, null, 2)}</pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

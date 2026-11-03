import React from 'react';
import { ShieldCheck, ShieldAlert, ShieldX, Hash, ArrowRight } from 'lucide-react';
import { Badge } from '../common/Badge';
import { Link } from 'react-router-dom';

export function GovernanceDecisionCard({
  decision = 'ALLOW',
  riskScore = 18,
  riskLevel = 'LOW',
  riskFactors = [],
  actionHash,
  blockReason,
  approvalId,
  claimId
}) {
  const getDecisionHeader = () => {
    switch (decision) {
      case 'ALLOW':
        return {
          bg: 'bg-[#0B1E14] border-emerald-500/40 shadow-lg shadow-emerald-950/20',
          icon: ShieldCheck,
          iconColor: 'text-[#ccff00]',
          title: 'Governance Gateway Verdict: ALLOW',
          subtitle: 'All deterministic policy rules satisfied. Sensitive execution authorized with idempotency token.'
        };
      case 'REQUIRE_APPROVAL':
        return {
          bg: 'bg-[#22170B] border-amber-500/40 shadow-lg shadow-amber-950/20',
          icon: ShieldAlert,
          iconColor: 'text-amber-400',
          title: 'Governance Gateway Verdict: REQUIRE_APPROVAL',
          subtitle: 'Threshold policy triggered. LangGraph workflow paused. Cryptographic action hash bound to approval.'
        };
      case 'DENY':
      default:
        return {
          bg: 'bg-[#220B10] border-rose-500/40 shadow-lg shadow-rose-950/20',
          icon: ShieldX,
          iconColor: 'text-rose-400',
          title: 'Governance Gateway Verdict: DENY',
          subtitle: 'Deterministic policy rule or security threshold violated. Execution halted safely (0 side effects).'
        };
    }
  };

  const header = getDecisionHeader();
  const HeaderIcon = header.icon;

  return (
    <div className={`rounded-2xl border p-5 ${header.bg}`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#121620] border border-[#1E2536]">
            <HeaderIcon className={`w-6 h-6 ${header.iconColor}`} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">{header.title}</h4>
            <p className="text-xs text-slate-300 mt-0.5">{header.subtitle}</p>
          </div>
        </div>
        <Badge variant={decision} size="lg">{decision}</Badge>
      </div>

      {/* Block reason notice if denied */}
      {blockReason && (
        <div className="mt-4 p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl text-xs text-rose-300">
          <strong className="font-bold">Violation Reason: </strong>
          <span>{blockReason}</span>
        </div>
      )}

      {/* Grid: Risk Scoring + Cryptographic Action Hash */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
        {/* Risk Assessment Box */}
        <div className="bg-[#121620] p-4 rounded-xl border border-[#1E2536]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Explainable Risk Engine
            </span>
            <Badge variant={riskLevel}>{riskLevel} ({riskScore}/100)</Badge>
          </div>

          {/* Progress meter */}
          <div className="w-full bg-[#1A2230] rounded-full h-2 overflow-hidden mb-3">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                riskScore < 30 ? 'bg-[#ccff00]' : riskScore < 70 ? 'bg-amber-400' : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(riskScore, 100)}%` }}
            />
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Evaluated Factors:</p>
            {riskFactors.length > 0 ? (
              riskFactors.map((factor, i) => (
                <div key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                  <span className="text-[#ccff00]">•</span>
                  <span>{factor}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic">Standard parameters, zero risk modifiers.</p>
            )}
          </div>
        </div>

        {/* Cryptographic Action Binding Box */}
        <div className="bg-[#121620] p-4 rounded-xl border border-[#1E2536]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-[#ccff00]" />
              <span>Exact-Action Binding Hash</span>
            </span>
            <span className="text-[10px] font-mono bg-[#18202D] px-1.5 py-0.5 rounded text-[#ccff00]">
              SHA-256
            </span>
          </div>

          <p className="text-xs text-slate-400 mb-2 leading-relaxed">
            Mathematical guarantee: Action canonical parameters cannot be modified prior to execution.
          </p>

          <div className="p-2.5 bg-[#0A0D14] text-[#ccff00] font-mono text-[10px] rounded-lg break-all border border-[#192130]">
            {actionHash || 'No action prepared'}
          </div>

          {approvalId && (
            <div className="mt-2.5 flex items-center justify-between text-xs">
              <span className="text-slate-400">Approval Reference:</span>
              <span className="font-mono font-bold text-[#ccff00]">{approvalId}</span>
            </div>
          )}
        </div>
      </div>

      {/* Call to action for paused approval */}
      {decision === 'REQUIRE_APPROVAL' && (
        <div className="mt-4 pt-4 border-t border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-amber-200 font-medium">
            Workflow paused. Switch demo persona to <strong className="text-white">MANAGER</strong> to review.
          </p>
          <Link
            to="/approvals"
            className="px-4 py-2 bg-[#ccff00] text-slate-950 font-extrabold text-xs rounded-xl hover:bg-[#bbf000] shadow-md shadow-[#ccff00]/15 flex items-center gap-1.5 transition-colors"
          >
            <span>Review Approvals Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}

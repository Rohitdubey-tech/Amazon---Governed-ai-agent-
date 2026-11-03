import React from 'react';

export function Badge({ children, variant = 'default', size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 font-semibold',
    md: 'text-xs font-semibold px-2.5 py-0.5',
    lg: 'text-xs font-bold px-3 py-1'
  };

  const variantStyles = {
    // Governance decisions
    ALLOW: 'bg-[#ccff00]/15 text-[#ccff00] border border-[#ccff00]/30 shadow-[0_0_12px_rgba(204,255,0,0.15)]',
    REQUIRE_APPROVAL: 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.15)]',
    DENY: 'bg-rose-500/15 text-rose-300 border border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.15)]',

    // Statuses
    PROCESSED: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
    SUCCEEDED: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
    WAITING_FOR_APPROVAL: 'bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse',
    PENDING: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
    APPROVED: 'bg-[#ccff00]/15 text-[#ccff00] border border-[#ccff00]/30',
    REJECTED: 'bg-rose-500/15 text-rose-300 border border-rose-500/30',
    BLOCKED: 'bg-rose-500/15 text-rose-300 border border-rose-500/30',
    FLAGGED: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
    COMPLETED: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
    PAUSED: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
    ACTIVE: 'bg-[#ccff00]/15 text-[#ccff00] border border-[#ccff00]/30',
    INACTIVE: 'bg-slate-800 text-slate-400 border border-slate-700',

    // Risk levels
    LOW: 'bg-[#ccff00]/15 text-[#ccff00] border border-[#ccff00]/30',
    MEDIUM: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
    HIGH: 'bg-rose-500/15 text-rose-300 border border-rose-500/30',

    // Roles
    EMPLOYEE: 'bg-blue-500/15 text-blue-300 border border-blue-500/30',
    MANAGER: 'bg-purple-500/15 text-purple-300 border border-purple-500/30',
    ADMIN: 'bg-[#ccff00]/15 text-[#ccff00] border border-[#ccff00]/30',

    // Generic
    default: 'bg-[#151B27] text-slate-300 border border-[#232C3E]',
    primary: 'bg-[#ccff00]/20 text-[#ccff00] border border-[#ccff00]/30',
    outline: 'border border-slate-700 text-slate-300'
  };

  const style = variantStyles[variant] || variantStyles.default;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full ${sizeClasses[size]} ${style} ${className}`}>
      {children}
    </span>
  );
}

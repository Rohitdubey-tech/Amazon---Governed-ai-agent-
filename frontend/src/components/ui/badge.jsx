import React from "react";
import { cn } from "../../lib/utils";

const badgeVariants = {
  default: "bg-[#ccff00]/10 text-[#ccff00] border-[#ccff00]/30",
  secondary: "bg-slate-800 text-slate-300 border-white/10",
  success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  danger: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  info: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  outline: "text-slate-300 border-white/20"
};

export const Badge = ({ className, variant = "default", children, ...props }) => {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors",
        badgeVariants[variant] || badgeVariants.default,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

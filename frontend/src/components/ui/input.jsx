import React from "react";
import { cn } from "../../lib/utils";

export const Input = React.forwardRef(({ className, type = "text", ...props }, ref) => {
  return (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-xl border border-white/10 bg-[#0B0F17] px-3.5 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#ccff00]/60 focus:ring-1 focus:ring-[#ccff00]/40 transition-all disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";

import React from "react";
import { cn } from "../../lib/utils";

const buttonVariants = {
  default: "bg-[#ccff00] text-black font-semibold hover:bg-[#b8e600] active:scale-[0.98] shadow-sm shadow-[#ccff00]/20",
  secondary: "bg-white/10 text-white hover:bg-white/15 border border-white/10",
  outline: "border border-white/15 text-slate-200 hover:bg-white/5 hover:text-white",
  ghost: "text-slate-400 hover:text-white hover:bg-white/5",
  danger: "bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20",
  success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
};

const buttonSizes = {
  sm: "h-8 px-3 text-xs rounded-lg",
  default: "h-10 px-4 py-2 text-sm rounded-xl",
  lg: "h-12 px-6 text-base rounded-xl",
  icon: "h-9 w-9 p-0 rounded-lg flex items-center justify-center"
};

export const Button = React.forwardRef(({
  className,
  variant = "default",
  size = "default",
  disabled,
  children,
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:pointer-events-none select-none",
        buttonVariants[variant] || buttonVariants.default,
        buttonSizes[size] || buttonSizes.default,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";

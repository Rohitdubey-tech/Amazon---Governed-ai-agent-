import React from "react";
import { cn } from "../../lib/utils";

export const Card = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-2xl border border-white/10 bg-[#0E131F]/90 backdrop-blur-xl text-slate-100 shadow-xl shadow-black/40",
      className
    )}
    {...props}
  >
    {children}
  </div>
));
Card.displayName = "Card";

export const CardHeader = React.forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props}>
    {children}
  </div>
));
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef(({ className, children, ...props }, ref) => (
  <h3 ref={ref} className={cn("text-base font-semibold text-white tracking-tight leading-none", className)} {...props}>
    {children}
  </h3>
));
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef(({ className, children, ...props }, ref) => (
  <p ref={ref} className={cn("text-xs text-slate-400 mt-1", className)} {...props}>
    {children}
  </p>
));
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props}>
    {children}
  </div>
));
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props}>
    {children}
  </div>
));
CardFooter.displayName = "CardFooter";

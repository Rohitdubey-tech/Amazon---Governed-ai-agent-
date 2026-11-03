import React from "react";
import { cn } from "../../lib/utils";

export const Progress = ({ value = 0, max = 100, className, indicatorClassName }) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn("relative h-2 w-full overflow-hidden rounded-full bg-white/10", className)}>
      <div
        className={cn("h-full w-full flex-1 bg-[#ccff00] transition-all duration-300", indicatorClassName)}
        style={{ transform: `translateX(-${100 - percentage}%)` }}
      />
    </div>
  );
};

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Standard shadcn/ui cn helper function
 * Combines conditional class names with clsx and merges Tailwind classes with tailwind-merge.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}


import type { ClassValue } from "clsx"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"


/**
 * A utility function to merge Tailwind and clsx classes together.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

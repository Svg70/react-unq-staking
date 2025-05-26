import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

const CLASS_APP_PREFIX = "react_unq_staking_app-";

export function cn(...inputs: ClassValue[]): string {
  const combined = clsx(inputs);
  const merged = twMerge(combined);

  return merged
    .split(/\s+/)
    .filter(Boolean)
    .map((cls) => `${CLASS_APP_PREFIX}${cls}`)
    .join(" ");
}

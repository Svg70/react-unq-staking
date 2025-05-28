import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";


export function cn(...inputs: ClassValue[]): string {
  const combined = clsx(inputs);
  const merged = twMerge(combined);

  return merged

}

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utilitário padrão do shadcn/ui para mesclar classes Tailwind
 * sem conflitos (ex: `p-4` + `p-6` → `p-6`).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

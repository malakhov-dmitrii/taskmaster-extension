export const cx = (...classNames: (string | undefined)[]) => classNames.filter(Boolean).join(' ');

export const getRandomCode = () =>
  +Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, '0');

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

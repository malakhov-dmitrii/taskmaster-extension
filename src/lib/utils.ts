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

export const badgeIncrement = async () => {
  chrome.runtime.sendMessage('badgeIncrement');
  // const tab = await chrome.tabs.query({ active: true, currentWindow: true });
  // const tabId = tab[0].id;

  // chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  //   console.log({ tabs });
  // });

  // const text = await chrome.action.getBadgeText({});
  // console.log({ text });
};

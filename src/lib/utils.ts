export const cx = (...classNames: (string | undefined)[]) => classNames.filter(Boolean).join(' ');

export const getRandomCode = () =>
  +Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, '0');

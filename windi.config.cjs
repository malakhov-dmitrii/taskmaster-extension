/** @type {import('windicss').Config} */

module.exports = {
  // corePlugins: {
  //   preflight: false,
  // },
  // content: ['./index.html', './src/**/*.{html,js,svelte,ts}', './dist/**/*.{html,js,svelte,ts}'],

  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)'],
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('windicss/plugin/forms'), require('windicss/plugin/line-clamp')],
};

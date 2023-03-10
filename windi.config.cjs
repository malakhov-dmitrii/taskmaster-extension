/** @type {import('windicss').Config} */
module.exports = {
  // corePlugins: {
  //   preflight: false,
  // },
  // content: ['./index.html', './src/**/*.{html,js,svelte,ts}', './dist/**/*.{html,js,svelte,ts}'],
  plugins: [require('windicss/plugin/forms'), require('windicss/plugin/line-clamp')],
};

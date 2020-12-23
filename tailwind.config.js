const colors = require('tailwindcss/colors')

const production = !process.env.ROLLUP_WATCH; // or some other env var like NODE_ENV
module.exports = {
  darkMode: 'media',
  future: { // for tailwind 2.0 compat
    purgeLayersByDefault: true, 
    removeDeprecatedGapUtilities: true,
  },
  purge: {
    content: [
      "./src/**/*.svelte",
      // may also want to include base index.html
    ], 
    enabled: production // disable purge in dev
  },
  theme: {
    fontFamily: {
      'sans': ['Roboto', 'ui-sans-serif', 'system-ui', 'sans-serif']
    },
    colors: {
      dark: '#060A0E',
      darkSecondary: '#161C22',
      light: '#FCFCFC',
      lightSecondary: '#EDEDED',
      accent: '#14AEAC',
      lemmi: '#ABE0E8',
      red: colors.red,
      green: colors.green
    }
  },
};
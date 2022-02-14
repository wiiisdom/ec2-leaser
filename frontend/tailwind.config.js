// add your custom configurations
module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/*.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        primary: '#61DAFB',
        secondary: '#282C34'
      },
      animation: {
        'spin-slow': 'spin 20s linear infinite'
      }
    }
  },
  variants: {
    extend: {}
  },
  plugins: []
};

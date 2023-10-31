/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      extend: {
        colors: {
          primary: '#61DAFB',
          secondary: '#282C34'
        },
        animation: {
          'spin-slow': 'spin 20s linear infinite'
        }
      }
    }
  },
  plugins: []
};

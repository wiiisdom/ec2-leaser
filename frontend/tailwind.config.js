module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#61DAFB',
        secondary: '#282C34'
      },
      animation: {
        'spin-slow': 'spin 20s linear infinite'
      }
    },
  },
  plugins: [],
}

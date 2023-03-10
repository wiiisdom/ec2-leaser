module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx,html}",
  ],
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
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'hydro-deep-aqua': '#0A4C78',
        'hydro-spark-blue': '#1EA7D6',
        'hydro-sky-blue': '#E6F6FB',
        'hydro-green': '#5FB58C',
        'hydro-charcoal': '#2E2E2E',
      },
    },
  },
  plugins: [],
}

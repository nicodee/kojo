/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nordic: {
          bg: '#090a0f',
          surface: '#12141c',
          border: 'rgba(255, 255, 255, 0.08)',
          accent: '#10b981',
          accentLight: '#34d399',
          amber: '#f59e0b',
          blue: '#38bdf8'
        }
      }
    },
  },
  plugins: [],
}

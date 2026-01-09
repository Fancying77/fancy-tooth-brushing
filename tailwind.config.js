/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bean-pink': '#FFB6C1',
        'bean-blue': '#87CEEB',
        'bean-yellow': '#FFE44D',
        'bean-orange': '#FFA07A',
      },
      fontSize: {
        'super': '2rem',
        'mega': '2.5rem',
      }
    },
  },
  plugins: [],
}

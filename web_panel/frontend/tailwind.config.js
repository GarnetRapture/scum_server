/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neon-blue': '#00f0ff',
        'neon-green': '#39ff14',
        'neon-red': '#ff3131',
        'bg-base': '#080a0f',
        'bg-surface': 'rgba(17, 22, 34, 0.75)',
      },
      fontFamily: {
        heading: ['Space Grotesk', 'sans-serif'],
        body: ['Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

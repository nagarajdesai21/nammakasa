/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        karnataka: {
          primary: '#FF6B00', // Orange - Karnataka Government color
          secondary: '#003D82', // Dark blue
          accent: '#00A86B', // Green
          light: '#F5F5F5',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

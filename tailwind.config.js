/** @type {import('tailwindcss').Config} */
const config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}', './lib/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        body: ['Manrope', 'sans-serif'],
        display: ['Sora', 'sans-serif'],
      },
      colors: {
        eco: {
          50: '#f3fbf6',
          100: '#d7f3e0',
          200: '#b4e7c8',
          300: '#81d7a7',
          400: '#4ec383',
          500: '#1fa364',
          600: '#128551',
          700: '#0f6a42',
          800: '#0f5436',
          900: '#0f442e',
        },
      },
    },
  },
  plugins: [],
}

module.exports = config


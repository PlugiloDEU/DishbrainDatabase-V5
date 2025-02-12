/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    'bg-emerald-500',
    'bg-amber-500',
    'bg-red-500',
    'text-emerald-500',
    'text-amber-500',
    'text-red-500',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1a237e',
        secondary: {
          light: '#4f83cc',
          DEFAULT: '#1565c0',
          dark: '#0d47a1',
        },
        accent: '#f50057',
      },
      fontFamily: {
        sans: ['Cabin', 'sans-serif'],
        display: ['Montserrat', 'sans-serif'],
        body: ['Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'pastel-aqua': '#E0F7F6',
        'pastel-tan': '#F7E8DC',
        'pastel-blond': '#FDF5E6',
        'pastel-mauve': '#E6E6FA',
      },
    },
  },
  plugins: [],
};

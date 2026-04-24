/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          black: '#080808',
          gold: '#fbbf24',
          cream: '#fff7e6',
        },
      },
      boxShadow: {
        glow: '0 0 80px rgba(251, 191, 36, 0.18)',
      },
    },
  },
  plugins: [],
};

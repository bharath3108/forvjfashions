/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff5f7',
          100: '#ffe4ea',
          200: '#ffc9d6',
          300: '#ff9fb5',
          400: '#ff6b8f',
          500: '#f43f6b',
          600: '#e01e52',
          700: '#bd1243',
          800: '#9d133d',
          900: '#861538'
        },
        cream: '#fffbf5',
        mint: '#e8f8f2'
      },
      fontFamily: {
        display: ['"Segoe UI"', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};

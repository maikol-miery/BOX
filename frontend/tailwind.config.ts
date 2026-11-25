/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './composables/**/*.{js,ts}',
    './app.vue'
  ],
  theme: {
    extend: {
      colors: {
        cobalto: {
          50: '#EEF0FF',
          100: '#E0E3FF',
          200: '#C7CCFE',
          300: '#A5ACFC',
          400: '#7C82F9',
          500: '#4345F6',
          600: '#3537E0',
          700: '#2A2BC4',
          800: '#24259E',
          900: '#21237D',
          950: '#14144D'
        }
      }
    }
  }
};

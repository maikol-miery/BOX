import type { Config } from 'tailwindcss';

export default <Partial<Config>>{
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './composables/**/*.{js,ts}',
    './app.vue'
  ],
  theme: {
    extend: {
      keyframes: {
        flotarLento: {
          '0%, 100%': {
            transform: 'translateY(0px)',
            boxShadow: '0 10px 25px -5px rgba(139, 92, 246, 0.08)'
          },
          '50%': {
            transform: 'translateY(-8px)',
            boxShadow: '0 20px 35px -5px rgba(139, 92, 246, 0.22)'
          }
        },
        flotarMedio: {
          '0%, 100%': {
            transform: 'translateY(0px)'
          },
          '50%': {
            transform: 'translateY(-6px)'
          }
        }
      },
      animation: {
        'flotar-lento': 'flotarLento 6s ease-in-out infinite',
        'flotar-medio': 'flotarMedio 4s ease-in-out infinite'
      }
    }
  }
};

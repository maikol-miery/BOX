export default defineNuxtConfig({
  compatibilityDate: '2024-08-01',
  devtools: { enabled: false },
  ssr: false,
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/principal.css'],
  colorMode: {
    preference: 'light',
    fallback: 'light',
    classSuffix: ''
  },
  devServer: {
    host: '0.0.0.0',
    port: 3000,
    https: true
  },
  routeRules: {
    '/api/**': {
      proxy: 'http://localhost:4000/api/**'
    }
  },
  runtimeConfig: {
    public: {
      urlApiBackend: process.env.NUXT_PUBLIC_URL_API_BACKEND || '/api'
    }
  },
  app: {
    head: {
      title: 'Box | Gestión IT - Industrias Rodanol, S.A.',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' },
        { name: 'theme-color', content: '#4345F6' },
        {
          name: 'description',
          content: 'Aplicación Web Progresiva (PWA) para la Gestión Integral de Activos Informáticos, Mantenimientos, Insumos y Custodia de Industrias Rodanol, S.A.'
        }
      ],
      link: [
        { rel: 'manifest', href: '/manifiesto.webmanifest' }
      ]
    }
  }
});

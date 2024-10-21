// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  vite: {
    optimizeDeps: {
      include: ['bn.js']
    }
  },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  nitro: {
    devProxy: {
      '/api': {
        target: 'http://localhost:3001', // Your backend URL
        changeOrigin: true,
      },
    },
  },
  modules: ['@nuxt/image', ['@nuxtjs/google-fonts', {
    families: {
      Roboto: true,
      Outfit: true,
      Inter: [400, 700],
      'Josefin+Sans': true,
      Lato: [100, 300],
      Raleway: {
        wght: [100, 400],
        ital: [100]
      }
    }
  }]],
  build: {
    transpile: ['@polkadot/api', '@polkadot/util-crypto', '@polkadot/extension-dapp', 'rxjs'],
  },
})
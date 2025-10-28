export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  ssr: false,
  nitro: {
    preset: 'static'
  },

  css: [
    "bootstrap/dist/css/bootstrap.css",
    "~/assets/bootstrap-icons.css"
  ],

  app: {
    head: {
      title: "Repogit",
      viewport: "width=device-width, height=device-height, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=0",
      link: [
        { rel: "icon", href: "/bloctopus.svg" },
        {
          rel: 'preload',
          href: '/fonts/bootstrap-icons.woff2',
          as: 'font',
          type: 'font/woff2',
          crossorigin: 'anonymous'
        },
        {
          rel: 'preload',
          href: '/fonts/bootstrap-icons.woff',
          as: 'font',
          type: 'font/woff',
          crossorigin: 'anonymous'
        }
      ],
      script: [{ src: "/theme.js" }]
    }
  },

  pwa: {
    includeAssets: [
      '/fonts/*'
    ],
    manifest: {
      name: 'Repogit',
      short_name: 'Repogit',
      start_url: '/',
      description: 'Block and octopus',
      theme_color: '#000000',
      background_color: "#000000",
      icons: [
        {
          src: '/bloctopus_small.svg',
          sizes: 'any',
          type: 'image/svg+xml',
        },
        {
          src: '/bloctopus_192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/bloctopus_512x512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ],
    },
    registerType: 'autoUpdate',
    workbox: {
      navigateFallback: '/index.html',
      globPatterns: ['**/*']
    }
  },

  modules: ["@pinia/nuxt", "@vite-pwa/nuxt"]
});

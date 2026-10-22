import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icons/*.png', 'icons/*.svg'],
      manifest: {
        name: 'Stockholm Day Builder - MBA Guide',
        short_name: 'SthlmDay',
        description: 'Minimalist offline day planner for an MBA student exploring Stockholm.',
        theme_color: '#090a0f',
        background_color: '#090a0f',
        display: 'standalone',
        orientation: 'portrait',
        scope: './',
        start_url: './',
        icons: [
          {
            src: 'icons/icon-192x192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: 'icons/icon-512x512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === self.location.origin,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'sthlm-app-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ]
      }
    })
  ]
});

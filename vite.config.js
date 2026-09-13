import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // aggiorna il SW in automatico ad ogni nuova build
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png'],

      // Qui definiamo il manifest: vite-plugin-pwa genera automaticamente
      // /manifest.webmanifest e lo collega nell'<head> dell'index.html
      manifest: {
        name: 'Vinyl & CD Catalog',
        short_name: 'VinylCatalog',
        description: 'Catalogo personale di CD e vinili con scanner di codici a barre',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },

      // Strategia "generateSW": vite-plugin-pwa crea in automatico un
      // service worker (basato su Workbox) che precachea gli asset
      // dell'app e permette il funzionamento offline.
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        // Le copertine album arrivano da Discogs (img.discogs.com):
        // le mettiamo in cache runtime così, una volta viste, restano
        // disponibili anche offline.
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.discogs\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'discogs-covers-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 giorni
              },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            urlPattern: /^https:\/\/api\.discogs\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'discogs-api-cache',
              networkTimeoutSeconds: 8,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 1 giorno
              }
            }
          }
        ]
      },

      devOptions: {
        enabled: true // permette di testare la PWA anche in `npm run dev`
      }
    })
  ],
  server: {
    host: true, // necessario per testare la fotocamera da un altro device in LAN (https richiesto)
    port: 5173
  }
})

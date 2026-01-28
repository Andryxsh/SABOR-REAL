import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
// === CONFIGURACIÓN V2 (NUEVO) ===
import path from 'path'
// === FIN CONFIGURACIÓN V2 ===

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Sabor Real App',
        short_name: 'SaborReal',
        description: 'Gestión de grupo musical Sabor Real',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  // === CONFIGURACIÓN V2 (NUEVO) ===
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // === FIN CONFIGURACIÓN V2 ===
})

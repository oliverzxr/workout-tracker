import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { brand } from './src/app/pt-BR';
import { openFoodFactsProxy } from './server/openFoodFacts';

export default defineConfig(({ mode }) => ({
  base: process.env.VITE_BASE_PATH || './',
  build: mode === 'demo' ? { outDir: 'dist-demo', rollupOptions: { input: 'demo.html' } } : undefined,
  plugins: [
    react(),
    openFoodFactsProxy(),
    VitePWA({
      disable: mode === 'demo',
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['icons/apple-touch-icon.png', 'icons/mark.svg'],
      manifest: {
        id: './', name: brand.name, short_name: brand.short,
        lang: 'pt-BR', description: 'Registro de treinos de musculação.',
        start_url: './', scope: './', display: 'standalone',
        theme_color: '#000000', background_color: '#000000',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        clientsClaim: true,
        globPatterns: ['**/*.{js,css,html,woff2,woff,png,svg,webp,webmanifest}'],
        cleanupOutdatedCaches: true,
        navigateFallbackDenylist: [/\.[^/]+$/],
      },
    }),
  ],
}));

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'src/admin/index.html')
      }
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://tg-game-tab-server.onrender.com',
        changeOrigin: true,
        secure: false,
        headers: {
          'Access-Control-Allow-Origin': '*'
        }
      }
    }
  }
})
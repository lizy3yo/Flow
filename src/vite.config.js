import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://flow-app.alwaysdata.net', // Your AlwaysData domain
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '/flow-application-cc/api')
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})

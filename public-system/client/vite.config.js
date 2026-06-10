import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3003,
    proxy: {
      '/api': {
        target: 'http://localhost:4003',
        changeOrigin: true
      }
    }
  }
});

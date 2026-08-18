import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'vue-vendor', test: /node_modules[\\/]vue|node_modules[\\/]pinia|node_modules[\\/]vue-router/ },
            { name: 'element-plus', test: /node_modules[\\/]element-plus|node_modules[\\/]@element-plus/ },
            { name: 'echarts', test: /node_modules[\\/]echarts|node_modules[\\/]zrender/ },
          ],
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, ''),
      },
    },
  },
})

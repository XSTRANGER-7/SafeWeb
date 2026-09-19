import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    watch: {
      ignored: ['**/public/**']
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      
    },
  },
})

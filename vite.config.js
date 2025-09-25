import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 3003,
    strictPort: true,  // WICHTIG: Verhindert Port-Wechsel!
    host: true,
    open: true
  },
  preview: {
    port: 3003,
    strictPort: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/Epigenome2PhenomeDemo/',
  plugins: [react(), tailwindcss()],
  css: {
    modules: {
      localsConvention: 'camelCase'
    }
  }
})

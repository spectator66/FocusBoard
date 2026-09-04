import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/FocusBoard/' : '/',
  plugins: [
    react(),
    {
      name: 'focusboard-entry',
      transformIndexHtml: {
        order: 'pre',
        handler(html) {
          return html.replace('/src/main.jsx', '/src/focusboard-app.jsx')
        },
      },
    },
  ],
})

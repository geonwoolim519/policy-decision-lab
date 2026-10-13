import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const pagesRepo = process.env.GITHUB_REPOSITORY?.split("/")[1]
const pagesBase =
  process.env.GITHUB_PAGES === "true" && pagesRepo
    ? `/${pagesRepo}/`
    : "/"

export default defineConfig({
  base: pagesBase,
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    host: true,
  },
})

import path from 'node:path'
import os from 'node:os'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Avoid EPERM on Windows when the repo lives under OneDrive: Vite can't reliably
// remove node_modules/.vite/deps while the folder is synced/locked.
const cacheDir = path.join(os.tmpdir(), 'vite-cache-coffee-lab')

// https://vite.dev/config/
export default defineConfig({
  // Ensure SPA route fallback is used (e.g. /menu -> index.html).
  appType: 'spa',
  base: '/',
  cacheDir,
  plugins: [
    react(),
    tailwindcss(),
  ],
})

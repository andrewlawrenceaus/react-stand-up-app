import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const mocks = path.resolve(__dirname, 'src/utils/mocks')

// Vite config used exclusively for Playwright E2E tests.
// Aliases replace real Firebase SDK modules with in-memory mocks so no
// credentials or network access are needed.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      // Replace src/utils/firebase.js — matched by absolute resolved path so
      // relative imports like './firebase' and '../../utils/firebase' both hit this.
      {
        find: path.resolve(__dirname, 'src/utils/firebase'),
        replacement: path.resolve(mocks, 'firebase.js'),
      },
      // Replace firebase/auth and firebase/database SDK packages
      {
        find: 'firebase/auth',
        replacement: path.resolve(mocks, 'firebase-auth.js'),
      },
      {
        find: 'firebase/database',
        replacement: path.resolve(mocks, 'firebase-database.js'),
      },
    ],
  },
})

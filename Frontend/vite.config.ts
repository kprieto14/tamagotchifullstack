import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import checker from 'vite-plugin-checker'

export default defineConfig({
  plugins: [
    react(),
    checker({
      // TS type-checks in a worker
      typescript: { tsconfigPath: './tsconfig.json' },
    }),
  ],
})

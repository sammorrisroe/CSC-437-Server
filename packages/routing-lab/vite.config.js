import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
        "/api": "http://localhost:3000" // Forwards all requests at localhost:5173/api/*
    }
}
})

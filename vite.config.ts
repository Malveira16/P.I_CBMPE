import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: true,
    watch: {
      usePolling: true,
    },
    hmr: {
      protocol: "ws",
      host: "localhost",
      port: 5173,
    },
  },
});

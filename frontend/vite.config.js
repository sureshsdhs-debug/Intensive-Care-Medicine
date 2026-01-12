// vite.config.js
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default ({ mode }) => {
  // load .env, .env.[mode], etc. '' keeps the VITE_ prefix in keys
  const env = loadEnv(mode, process.cwd(), '');

  // Use the VITE_ prefixed variable; fallback to localhost for safety
  const BACKEND_BASE_URL = env.VITE_BACKEND_BASE_URL || 'http://localhost:5000';

  return defineConfig({
    plugins: [react()],
    server: {
      port: 5173, // front-end dev server port (avoid colliding with backend)
      proxy: {
        '/api': {
          target: BACKEND_BASE_URL,
          changeOrigin: true,
          secure: false,
          // keep path as /api on backend; remove rewrite if not needed
          // rewrite: (path) => path.replace(/^\/api/, '/api'),
        },
      },
    },
  });
};

import { defineConfig } from 'vite';

// base './' makes the build work on the web, inside Capacitor (mobile) and Tauri (desktop)
export default defineConfig({
  base: './',
  server: { host: true }
});

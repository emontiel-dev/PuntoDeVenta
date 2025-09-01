import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: true, // Esto expone el host y permite el acceso desde la red local
    port: 5173, // Puedes cambiar el puerto si lo necesitas
  },
});

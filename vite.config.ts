import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174
  },
  build: {
    outDir: 'dist'
  },
  base: '/', // Asegura que las rutas sean relativas
});

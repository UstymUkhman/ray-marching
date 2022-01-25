import path from 'path';
import { defineConfig } from 'vite';

import glsl from 'vite-plugin-glsl';
import { version } from './package.json';

export default defineConfig({
  base: './',
  plugins: [glsl()],

  define: {
    'import.meta.env.BUILD': JSON.stringify(version)
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },

  server: {
    host: '0.0.0.0',
    port: 8080,
    open: true
  }
});

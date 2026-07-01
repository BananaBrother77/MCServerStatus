import { resolve } from 'path';
import { defineConfig } from 'vite';
import ejs from 'ejs';
import { cloudflare } from '@cloudflare/vite-plugin';

const partialsDir = resolve(import.meta.dirname, 'partials');

export default defineConfig({
  plugins: [
    {
      name: 'html-includes',
      transformIndexHtml: {
        order: 'pre',
        handler: (html) => ejs.render(html, {}, { views: [partialsDir] }),
      },
    },
    cloudflare(),
  ],
  build: {
    rollupOptions: {
      input: {
        index: resolve(import.meta.dirname, 'index.html'),
        'color-codes': resolve(import.meta.dirname, 'color-codes.html'),
        'server-status': resolve(import.meta.dirname, 'server-status.html'),
        'player-viewer': resolve(import.meta.dirname, 'player-viewer.html'),
        '404': resolve(import.meta.dirname, '404.html'),
      },
    },
  },
  server: {
    host: '0.0.0.0',
  },
});

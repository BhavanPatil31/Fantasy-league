import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.NEXT_PUBLIC_KEY_API_KEY': JSON.stringify(env.NEXT_PUBLIC_KEY_API_KEY),
      'process.env.NEXT_PUBLIC_KEY_AUTH_DOMAIN': JSON.stringify(env.NEXT_PUBLIC_KEY_AUTH_DOMAIN),
      'process.env.NEXT_PUBLIC_KEY_PROJECT_ID': JSON.stringify(env.NEXT_PUBLIC_KEY_PROJECT_ID),
      'process.env.NEXT_PUBLIC_KEY_STORAGE_BUCKET': JSON.stringify(env.NEXT_PUBLIC_KEY_STORAGE_BUCKET),
      'process.env.NEXT_PUBLIC_KEY_MESSAGING_SENDER_ID': JSON.stringify(env.NEXT_PUBLIC_KEY_MESSAGING_SENDER_ID),
      'process.env.NEXT_PUBLIC_KEY_APP_ID': JSON.stringify(env.NEXT_PUBLIC_KEY_APP_ID),
      'process.env.NEXT_PUBLIC_KEY_DATABASE_ID': JSON.stringify(env.NEXT_PUBLIC_KEY_DATABASE_ID),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});

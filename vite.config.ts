import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // The (process as any).cwd() cast fixes potential TS issues in some environments.
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // SAFEGUARD: This ensures process.env.API_KEY is replaced with a string even if the env var is missing.
      // This prevents the "ReferenceError: process is not defined" crash in the browser.
      'process.env.API_KEY': JSON.stringify(env.API_KEY || '')
    }
  };
});
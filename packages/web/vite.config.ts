import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
  return {
    plugins: [react()],
    test: {
      environment: 'jsdom',
      setupFiles: './setup-tests.ts',
      coverage: {
        reporter: ['lcov', 'text']
      }
    }
  };
});

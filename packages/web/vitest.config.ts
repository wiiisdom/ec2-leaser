import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

import path from 'path';

export default defineConfig(() => {
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    test: {
      environment: 'jsdom',
      setupFiles: './setup-tests.ts',
      coverage: {
        reporter: ['lcov', 'text'],
        include: ['src/**/*.{ts,tsx}'],
        exclude: ['src/components/ui/**']
      }
    }
  };
});

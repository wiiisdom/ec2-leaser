import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
  return {
    plugins: [react()],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './test/setup.js',
      reporters: 'vitest-sonar-reporter',
      outputFile: 'sonar-report.xml',
      coverage: {
        reporter: ['lcov', 'text']
      }
    },
    resolve: {
      alias: {
        './runtimeConfig': './runtimeConfig.browser'
      }
    }
  };
});

import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    pool: 'forks',
    outputFile: 'sonar-report.xml',
    coverage: {
      reporter: ['lcov', 'text'],
    },
  },
});

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    threads: false,
    outputFile: "sonar-report.xml",
    coverage: {
      provider: "istanbul",
      reporter: ["lcov", "text"]
    }
  }
});

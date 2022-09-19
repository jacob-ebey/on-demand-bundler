import * as path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/node/**/*.test.ts"],
    alias: {
      "#bundler": path.resolve("./src/bundler.ts"),
      "#deps": path.resolve("./src/deps.nodeish.ts"),
      "#on-demand-bundler": path.resolve("./src/mod.ts"),
      "#plugins": path.resolve("./src/plugins.nodeish.ts"),
    },
  },
  define: {
    Deno: "undefined",
  },
});

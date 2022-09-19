import * as path from "path";
import { defineConfig } from "vitest/config";

const modPath = process.env.TEST_BUILD
  ? path.resolve("./dist/mod.js")
  : path.resolve("./src/mod.ts");

export default defineConfig({
  test: {
    include: ["test/node/**/*.test.ts"],
    alias: {
      "#bundler": path.resolve("./src/bundler.ts"),
      "#deps": path.resolve("./src/deps.nodeish.ts"),
      "#on-demand-bundler": modPath,
      "#plugins": path.resolve("./src/plugins.nodeish.ts"),
    },
  },
  define: {
    Deno: "undefined",
  },
});

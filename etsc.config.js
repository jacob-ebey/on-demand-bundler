import { nodeExternalsPlugin } from "esbuild-node-externals";

/** @type {import("esbuild-node-tsc/dist/config").Config} */
export default {
  tsConfigFile: "tsconfig.build.json",
  esbuild: {
    entryPoints: ["src/mod.ts"],
    bundle: true,
    target: "esnext",
    format: "esm",
    plugins: [nodeExternalsPlugin()],
  },
};

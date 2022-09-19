import { readFile, writeFile } from "fs";
import { promisify } from "util";
import * as esbuildNode from "esbuild";

export { extname, resolve as resolvePath, isAbsolute } from "path";

export const fromFileUrl = (url: string | URL) => {
  throw new Error("Not implemented");
};

export const readFileAsync = promisify(readFile);
export const writeFileAsync = promisify(writeFile);

let esbuildPromise: Promise<typeof esbuildNode> = Promise.resolve(esbuildNode);
if (typeof Bun !== "undefined") {
  esbuildPromise = import("esbuild-wasm/lib/browser");
}

export type { esbuildNode as esbuildTypes };

let esbuildInitialized: Promise<typeof esbuildNode>;
export function ensureEsbuildInitialized() {
  if (!esbuildInitialized) {
    if (typeof Bun !== "undefined") {
      esbuildInitialized = import("module")
        .then(({ createRequire }) => createRequire(import.meta.url))
        .then((require) =>
          esbuildPromise.then(async (esbuild) => {
            console.log(esbuild);
            return esbuild
              .initialize({
                // TODO: try to fix this type error
                wasmModule: new (globalThis as any).WebAssembly.Module(
                  await readFileAsync(
                    require.resolve("esbuild-wasm/esbuild.wasm")
                  )
                ),
                worker: false,
              })
              .then(() => esbuild);
          })
        );
    } else {
      esbuildInitialized = esbuildPromise
        .then((esbuild) => esbuild.initialize({}))
        .then(() => esbuildNode);
    }
  }

  return esbuildInitialized;
}

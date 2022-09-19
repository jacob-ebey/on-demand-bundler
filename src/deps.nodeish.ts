import { readFile, writeFile } from "fs";
import { promisify } from "util";
import * as esbuildBrowser from "esbuild-wasm/lib/browser.js";

export { extname, resolve as resolvePath, isAbsolute } from "path";

export const fromFileUrl = (url: string | URL) => {
  throw new Error("Not implemented");
};

export const readFileAsync = promisify(readFile);
export const writeFileAsync = promisify(writeFile);

let esbuild: typeof esbuildBrowser;
if (typeof Bun !== "undefined") {
  esbuild = esbuildBrowser;
} else {
  esbuild = await import("esbuild");
}
declare global {
  var esbuildInitialized: Promise<typeof esbuildBrowser>;
  var globalResolver: (id: string, parent: string) => Promise<string>;
}

export async function doResolve(id: string, parent: string) {
  if (!globalThis.globalResolver) {
    if (typeof Bun !== "undefined") {
      globalThis.globalResolver = Bun.resolve;
    } else {
      const { CachedInputFileSystem, ResolverFactory } = await import(
        "enhanced-resolve"
      );
      const resolver = ResolverFactory.createResolver({
        extensions: [".js", ".jsx", ".ts", ".tsx"],
        fileSystem: new CachedInputFileSystem(await import("fs"), 4000),
      });
      globalThis.globalResolver = (id, parent) =>
        new Promise<string>((resolve, reject) => {
          resolver.resolve({}, parent, id, {}, (error, result) => {
            if (error) {
              return reject(error);
            }
            if (!result) {
              return reject(
                new Error(`Could not resolve ${JSON.stringify({ id, parent })}`)
              );
            }
            return resolve(result);
          });
        });
    }
  }

  return globalThis.globalResolver(id, parent);
}

export type { esbuildBrowser as esbuildTypes };

export function ensureEsbuildInitialized() {
  if (!globalThis.esbuildInitialized) {
    if (typeof Bun !== "undefined") {
      globalThis.esbuildInitialized = import("module")
        .then(({ createRequire }) => createRequire(import.meta.url))
        .then(async (require) =>
          esbuild
            .initialize({
              // TODO: try to fix this type error
              wasmModule: new (globalThis as any).WebAssembly.Module(
                await readFileAsync(
                  require.resolve("esbuild-wasm/esbuild.wasm")
                )
              ),
              worker: false,
            })
            .then(() => esbuild)
        );
    } else {
      globalThis.esbuildInitialized = esbuild
        .initialize({})
        .then(() => esbuild);
    }
  }

  return globalThis.esbuildInitialized;
}

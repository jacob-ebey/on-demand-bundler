import { readFile, writeFile } from "https://deno.land/std@0.156.0/node/fs.ts";
import {
  toFileUrl,
  fromFileUrl,
  resolve as resolvePath,
} from "https://deno.land/std@0.156.0/node/path.ts";
import { promisify } from "https://deno.land/std@0.156.0/node/util.ts";
import esbuildWasm from "https://esm.sh/esbuild-wasm@0.15.8/lib/browser.js?pin=v86&target=deno";
import * as esbuildNative from "https://deno.land/x/esbuild@v0.15.8/mod.js";

export {
  extname,
  fromFileUrl,
  resolve as resolvePath,
  isAbsolute,
} from "https://deno.land/std@0.156.0/node/path.ts";

export const readFileAsync = promisify(readFile) as (
  path: string,
  encoding: "utf8"
) => Promise<string>;
export const writeFileAsync = promisify(writeFile) as (
  path: string,
  contents: string,
  encoding: "utf8"
) => Promise<string>;

export function doResolve(id: string, parent: string) {
  const specifier = toFileUrl(resolvePath(parent, id)).href;
  const resolved = fromFileUrl(import.meta.resolve(specifier));
  return Promise.resolve(resolved);
}

export type { esbuildWasm as esbuildTypes };

// @ts-ignore trust me
export const esbuild: typeof esbuildWasm =
  Deno.run === undefined ? esbuildWasm : esbuildNative;

let esbuildInitialized: Promise<typeof esbuildWasm>;
export function ensureEsbuildInitialized() {
  if (!esbuildInitialized) {
    if (Deno.run === undefined) {
      esbuildInitialized = esbuild
        .initialize({
          wasmURL: "https://esm.sh/esbuild-wasm@0.15.8/esbuild.wasm",
          worker: false,
        })
        .then(() => esbuild);
    } else {
      esbuildInitialized = Promise.resolve(esbuild);
    }
  }

  return esbuildInitialized;
}

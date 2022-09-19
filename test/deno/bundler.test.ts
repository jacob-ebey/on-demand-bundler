import { assertEquals } from "https://deno.land/std@0.156.0/testing/asserts.ts";

import { bundleFile } from "#on-demand-bundler";
import { ensureEsbuildInitialized, resolvePath } from "#deps";

import simpleBundleChecks from "../shared/simple-bundle-checks.ts";

function it(name: string, t: () => Promise<void>) {
  Deno.test(name, async () => {
    await t();

    const esbuild = (await ensureEsbuildInitialized()) as unknown as {
      stop: () => Promise<unknown>;
    };
    await esbuild.stop?.();
  });
}

it("bundles simple preact component", async () => {
  assertEquals(typeof bundleFile, "function");
  const bundled = await bundleFile({
    rootDirectory: resolvePath("./test/fixture"),
    fileToBundle: resolvePath(Deno.cwd(), "test/fixture/allowed/simple"),
    include: [/test[\/\\]fixture[\/\\]allowed[\/\\]/],
    publicPath: "/_script",
    jsxImportSource: "preact",
  });

  simpleBundleChecks(bundled);
});

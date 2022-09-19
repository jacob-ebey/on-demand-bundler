import { expect, it } from "vitest";

import { bundleFile } from "#on-demand-bundler";
import { resolvePath } from "#deps";

import simpleBundleChecks from "../shared/simple-bundle-checks";

it("bundles simple preact component", async () => {
  expect(typeof bundleFile).toBe("function");
  const bundled = await bundleFile({
    rootDirectory: resolvePath("./test/fixture"),
    fileToBundle: resolvePath(process.cwd(), "test/fixture/allowed/simple"),
    include: [/test[\/\\]fixture[\/\\]allowed[\/\\]/],
    publicPath: "/_script",
    jsxImportSource: "preact",
  });

  simpleBundleChecks(bundled);
});

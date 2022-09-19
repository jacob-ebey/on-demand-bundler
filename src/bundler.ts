import { ensureEsbuildInitialized, resolvePath, fromFileUrl } from "#deps";

import { externalsPlugin, loadFSPlugin } from "#plugins";

export type BundleFileArgs = {
  /**
   * The root directory of files allowed to be bundled.
   */
  rootDirectory: string;
  /**
   * A list of allowed patterns to bundle.
   */
  include: RegExp[];
  /**
   * The file to bundle relative to the root directory
   */
  fileToBundle: string;
  /**
   * The public pathname on which the on demand bundler is running.
   */
  publicPath: string;
  /**
   * The JSX import source to use.
   */
  jsxImportSource?: string;
  /**
   * The mode to run in.
   */
  mode?: "development" | "production";
};

export async function bundleFile(args: BundleFileArgs) {
  const mode = args.mode || "production";

  const rootDirectory = args.rootDirectory.startsWith("file:")
    ? fromFileUrl(args.rootDirectory)
    : args.rootDirectory;
  const esbuild = await ensureEsbuildInitialized();

  const toBundle = resolvePath(rootDirectory, args.fileToBundle);

  if (!toBundle.startsWith(rootDirectory)) {
    throw new Error(`The file to bundle must be inside the root directory.`);
  }

  if (!args.include.some((pattern) => pattern.test(toBundle))) {
    throw new Error(
      `The file to bundle must be included in the include patterns.`
    );
  }

  const result = await esbuild.build({
    entryPoints: [args.fileToBundle],
    bundle: true,
    write: false,
    platform: "browser",
    format: "esm",
    target: "es2019",
    jsx: "automatic",
    jsxImportSource: args.jsxImportSource,
    minify: mode === "production",
    // absWorkingDir: rootDirectory,
    sourceRoot: rootDirectory,
    plugins: [
      externalsPlugin({
        rootDirectory: args.rootDirectory,
        include: args.include,
        publicPath: args.publicPath,
      }),
      loadFSPlugin(),
    ],
  });

  const outputFile = result.outputFiles.find(
    (file) => file.path === "<stdout>"
  );

  if (!outputFile) {
    throw new Error(`No output file found.`);
  }

  return outputFile?.text;
}

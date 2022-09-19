import {
  doResolve,
  esbuildTypes,
  extname,
  fromFileUrl,
  isAbsolute,
  readFileAsync,
} from "#deps";

export function externalsPlugin({
  rootDirectory,
  include: toInclude,
  publicPath,
}: {
  rootDirectory: string;
  include: RegExp[];
  publicPath: string;
}): esbuildTypes.Plugin {
  return {
    name: "local-externals",
    setup(build) {
      build.onResolve({ filter: /.*/ }, async (args) => {
        if (isBareModuleId(args.path)) {
          const pkg = parseBareModuleId(args.path);

          return {
            path: `https://esm.sh/${pkg.name}${pkg.path}`,
            external: true,
          };
        }

        const path = args.path.startsWith("file:")
          ? fromFileUrl(args.path)
          : args.path;
        const resolveDir = args.resolveDir.startsWith("file:")
          ? fromFileUrl(args.resolveDir)
          : args.resolveDir;
        const toBundle = await doResolve(path, resolveDir);

        if (!toBundle.startsWith(rootDirectory)) {
          throw new Error(
            `The file to bundle must be inside the root directory.`
          );
        }

        if (!toInclude.some((pattern) => pattern.test(toBundle))) {
          throw new Error(
            `The file to bundle must be included in the include patterns.`
          );
        }

        if (args.importer) {
          const src = toBundle
            .slice(rootDirectory.length + 1)
            .replace(/\\/g, "/");

          return {
            path: `${publicPath}?${new URLSearchParams({ src }).toString()}`,
            external: true,
          };
        }

        return {
          path: toBundle,
        };
      });
    },
  };
}

export function loadFSPlugin(): esbuildTypes.Plugin {
  return {
    name: "load-fs",
    setup(build) {
      build.onLoad({ filter: /.*/ }, async (args) => {
        const contents = await readFileAsync(args.path, "utf8");

        return {
          contents,
          loader: getLoader(args.path),
        };
      });
    },
  };
}

function getLoader(file: string): esbuildTypes.Loader {
  const ext = extname(file);
  switch (ext) {
    case ".js":
    case ".jsx":
      return "jsx";
    case ".ts":
      return "ts";
    case ".tsx":
      return "tsx";
    case ".json":
      return "json";
    case ".css":
      return "file";
    default:
      return "text";
  }
}

function parseBareModuleId(id: string) {
  const packageNameSplit = id.split("/");
  let name = packageNameSplit[0];
  let path = packageNameSplit.slice(1).join("/");
  if (name.startsWith("@")) {
    name = packageNameSplit.slice(0, 1).join("/");
    path = packageNameSplit.slice(2).join("/");
  }
  path = path ? `/${path}` : "";

  return { name, path };
}

function isBareModuleId(id: string) {
  return !id.startsWith(".") && !id.startsWith("/") && !isAbsolute(id);
}

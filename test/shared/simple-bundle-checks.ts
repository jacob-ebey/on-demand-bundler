export default function simpleBundleChecks(bundled: string) {
  if (
    !bundled.includes(
      "/_script?" + new URLSearchParams({ src: "allowed/sub.tsx" }).toString()
    )
  ) {
    throw new Error(
      "The bundle should include the sub import as externalized import."
    );
  }

  if (!bundled.includes("https://esm.sh/preact/jsx-runtime")) {
    throw new Error(
      "The bundle should include the preact jsx-runtime import as externalized import."
    );
  }

  if (!bundled.includes("https://esm.sh/preact/hooks")) {
    throw new Error(
      "The bundle should include the preact hooks import as externalized import."
    );
  }
}

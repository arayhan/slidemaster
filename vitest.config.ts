import { defineConfig } from "vitest/config";

// Deliberately standalone, NOT a `test` block inside vite.config.ts.
//
// vite.config.ts mounts nitro() and tanstackStart(), which install SSR and
// server-environment machinery. Loaded under vitest they reach vite's
// module-runner inlining and throw "ReferenceError: module is not defined",
// then hang teardown for 10s. Tests need none of it, so none of it loads here.
export default defineConfig({
  // The one thing tests do need from the app config: `@/*` resolves from
  // tsconfig "paths", as it does in the app. Without it every import of
  // "@/domain" fails to resolve under test only.
  resolve: { tsconfigPaths: true },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts?(x)"],
  },
});

import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

// See docs/architecture.md#the-import-rules — these zones are the enforced version of
// the import rules in CLAUDE.md. Keep them in sync if either changes.
const SIBLING_MODULE = "Modules never import each other. Put the shared vocabulary in domain/.";
const OUTSIDE_MODULE =
  `From inside a module subfolder, "../" reaches this module's own root; anything outside the module goes through the @/ alias. A bare "../../" is either a sibling module or a path that breaks when the file moves.`;

const ROUTES_COMPOSE = "routes/ composes; nothing composes routes/. Move the shared piece down.";
const SERVER_ONLY =
  "server-only. Reachable from route handlers and server components, not from a client module.";
const NOTHING_BELOW =
  "Nothing below modules/ imports a module. Move the shared piece down into services/ or domain/.";

const importZones = [
  // IMPORTANT: two config objects that set the same rule REPLACE each other for a
  // file matching both — options do not merge. So these scopes are mutually
  // exclusive and each repeats every pattern that applies to it. Splitting them by
  // concern instead would mean the last-matching zone silently wins, which is how
  // the module boundary went unenforced here for so long.
  {
    files: ["src/modules/*/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["@/routes/*", "@/routes"], message: ROUTES_COMPOSE },
            { group: ["@/modules/*"], message: SIBLING_MODULE },
            { regex: "^\\.\\./(?!\\.\\./)", message: SIBLING_MODULE },
            { group: ["@/server/*"], message: SERVER_ONLY },
          ],
        },
      ],
    },
  },
  {
    files: ["src/modules/*/*/*.{ts,tsx}", "src/modules/*/*/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["@/routes/*", "@/routes"], message: ROUTES_COMPOSE },
            { group: ["@/modules/*"], message: SIBLING_MODULE },
            { regex: "^\\.\\./\\.\\.", message: OUTSIDE_MODULE },
            { group: ["@/server/*"], message: SERVER_ONLY },
          ],
        },
      ],
    },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/modules/**", "src/routes/**", "src/server/**", "src/domain/**"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [{ group: ["@/routes/*", "@/routes"], message: ROUTES_COMPOSE }, { group: ["@/modules/*"], message: NOTHING_BELOW }, { group: ["@/server/*"], message: SERVER_ONLY }] }],
    },
  },
  {
    files: ["src/server/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [{ group: ["@/routes/*", "@/routes"], message: ROUTES_COMPOSE }, { group: ["@/modules/*"], message: NOTHING_BELOW }] }],
    },
  },
  {
    files: ["src/domain/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/modules/*", "@/routes/*", "@/routes", "@/server/*", "@/components/*"],
              message: "domain/ is the bottom of the import graph. It must not import upward.",
            },
          ],
        },
      ],
    },
  },
];

export default tseslint.config(
  { ignores: [".output", ".vinxi", "routeTree.gen.ts"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
  },
  ...importZones
);

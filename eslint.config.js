import js from "@eslint/js";
import ts from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import prettierConfig from "eslint-config-prettier";
import pluginPrettier from "eslint-plugin-prettier";
import unicorn from "eslint-plugin-unicorn";
import sonarjs from "eslint-plugin-sonarjs";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import pluginImport from "eslint-plugin-import";

export default ts.config(
  // ─── Global ignores ───────────────────────────────────────────────────────
  {
    ignores: ["dist/**", "build/**", "node_modules/**", "coverage/**", ".reports/**", "*.d.ts", "public/**"],
  },

  // ─── Base JS rules ────────────────────────────────────────────────────────
  js.configs.recommended,

  // ─── TypeScript rules (strict + stylistic) ────────────────────────────────
  ...ts.configs.strictTypeChecked,
  ...ts.configs.stylisticTypeChecked,

  // ─── Vue 3 rules ──────────────────────────────────────────────────────────
  ...pluginVue.configs["flat/strongly-recommended"],

  // ─── SonarJS — catches code-smell patterns ───────────────────────────────
  sonarjs.configs.recommended,

  // ─── Unicorn — modern JS idioms ───────────────────────────────────────────
  unicorn.configs["flat/recommended"],

  // ─── Import ordering — applied to all TS / Vue / JS source files ──────────
  //
  // We use `eslint-plugin-simple-import-sort` (by lydell) which produces the
  // most semantically correct grouping for TypeScript + Vue projects and is
  // fully auto-fixable via `eslint --fix`.
  //
  // Group order (each group is separated by a blank line):
  //   [0] Node.js built-in modules          — node:fs, node:path …
  //   [1] External libraries / frameworks   — vue, vue-router, pinia, uuid …
  //   [2] Type-only external imports         — import type { Ref } from 'vue'
  //   [3] Absolute project imports (@ alias) — @/store/…, @/types/…
  //   [4] Relative imports                   — ../foo, ./bar, ./index
  //   [5] Side-effect & CSS imports          — './style.css', 'reflect-metadata'
  //
  // Within each group, imports are sorted case-insensitively A→Z.
  //
  // Vue-component-specific ordering inside group [1]:
  //   Vue core → Vue Router → Pinia → vue-i18n → other UI libs → utilities
  //   This is achieved through the regex priority ordering within the group.
  {
    files: ["src/**/*.{ts,tsx,jsx,vue}", "vite.config.ts", "*.config.{ts,js}"],

    plugins: {
      "simple-import-sort": simpleImportSort,
      import: pluginImport,
    },

    rules: {
      // ── Sorting ─────────────────────────────────────────────────────────────
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            // [0] Node.js built-ins — always first
            // Matches bare `node:*` protocol AND the most common un-prefixed
            // Node built-ins (path, fs, url, crypto, os, stream, …).
            [
              "^node:",
              "^(assert|buffer|child_process|cluster|console|constants|crypto|dgram|dns|domain|events|fs|http|https|module|net|os|path|punycode|querystring|readline|repl|stream|string_decoder|sys|timers|tls|tty|url|util|v8|vm|zlib)(/|$)",
            ],

            // [1] External packages — Vue ecosystem first, then everything else.
            //
            // The sub-arrays inside this outer array are alternative regexes for
            // the SAME group — simple-import-sort will keep them in one block
            // separated from other groups but sorted A→Z within the block.
            // We use a single regex with alternation so all externals land in
            // one blank-line group, but Vue/framework packages sort before
            // generic libraries because of the priority alternation order.
            //
            // Priority inside this group (all stay in group [1]):
            //   a. Vue core + official ecosystem (router, pinia, i18n, devtools)
            //   b. UI / component libraries
            //   c. Utility libraries + everything else external
            [
              // a) Vue core ecosystem
              "^vue$",
              "^vue-router",
              "^pinia",
              "^vue-i18n",
              "^@vue/",
              // b) Other external packages (catch-all for any remaining externals)
              "^\\w",
              "^@(?!/)\\w",
            ],

            // [2] Type-only imports from external packages.
            // TypeScript's `import type` — placed after value imports so readers
            // can immediately distinguish runtime vs. compile-time dependencies.
            ["^.+\\u0000$"],

            // [3] Absolute project imports via the @ alias (src/*).
            // Non-component modules: stores, types, composables, utils, api …
            ["^@/(?!components)"],
            // Component imports via @ alias get their own sub-group so they
            // visually cluster together before relative imports.
            ["^@/components"],

            // [4] Relative imports in three sub-groups:
            //   parent  → ../
            //   sibling → ./
            //   index   → . (bare dot)
            ["^\\.\\.(?!/?$)", "^\\.\\./?$"],
            ["^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"],

            // [5] Side-effect imports & CSS — absolutely last.
            // These have intentional ordering requirements so we don't sort
            // them relative to each other, just keep them in their own group.
            ["^\\u0000", "\\.css$", "\\.scss$", "\\.less$", "\\.sass$"],
          ],
        },
      ],

      // Exports should also be sorted consistently
      "simple-import-sort/exports": "error",

      // ── Complementary import hygiene rules ───────────────────────────────────
      // Disallow duplicate import statements for the same module.
      // `prefer-inline` merges `import type` with the value import when
      // possible, keeping `consistent-type-imports` (`inline-type-imports`)
      // in harmony with this rule.
      "import/no-duplicates": ["error", { "prefer-inline": true }],
    },
  },

  // ─── Main application config ──────────────────────────────────────────────
  {
    files: ["src/**/*.{ts,tsx,jsx,vue}", "vite.config.ts"],

    plugins: {
      prettier: pluginPrettier,
    },

    languageOptions: {
      parserOptions: {
        // Type-aware linting — links ESLint to your tsconfig
        projectService: true,
        tsconfigRootDir: import.meta.dirname,

        // Required for Vue SFC parsing
        parser: ts.parser,
        extraFileExtensions: [".vue"],
      },
    },

    rules: {
      // ── Prettier integration ───────────────────────────────────────────────
      // Runs Prettier as an ESLint rule so a single `eslint --fix` reformats too
      "prettier/prettier": "error",

      // ── TypeScript — strict additions ─────────────────────────────────────
      // no `any` — use `unknown` and narrow safely
      "@typescript-eslint/no-explicit-any": "error",
      // Force explicit return types on public functions for clear APIs
      "@typescript-eslint/explicit-function-return-type": [
        "error",
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
          allowDirectConstAssertionInArrowFunctions: true,
        },
      ],
      // Force explicit accessibility on class members
      "@typescript-eslint/explicit-member-accessibility": ["error", { accessibility: "explicit" }],
      // Prefer `interface` for object shapes
      "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
      // Require type-only imports to be declared as such (`import type ...`)
      "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports", fixStyle: "inline-type-imports" }],
      // Disallow non-null assertion operator `!` — handle null explicitly
      "@typescript-eslint/no-non-null-assertion": "error",
      // Disallow floating Promises (easy async bug source)
      "@typescript-eslint/no-floating-promises": "error",
      // Require awaiting in async functions or explicit void
      "@typescript-eslint/require-await": "error",
      // Warn on unnecessary type assertions
      "@typescript-eslint/no-unnecessary-type-assertion": "error",
      // Prefer nullish coalescing over logical OR for defaults
      "@typescript-eslint/prefer-nullish-coalescing": "error",
      // Prefer optional chaining over manually guarded property access
      "@typescript-eslint/prefer-optional-chain": "error",
      // Ban ts-ignore — use ts-expect-error with a comment instead
      "@typescript-eslint/ban-ts-comment": [
        "error",
        {
          "ts-expect-error": "allow-with-description",
          "ts-ignore": true,
          "ts-nocheck": true,
          "ts-check": false,
        },
      ],
      // No unused variables or parameters (mirrors tsconfig flags)
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      // Require correct Promise handling
      "@typescript-eslint/no-misused-promises": "error",
      // Disallow unsafe member access on `any`-typed values
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-return": "error",

      // ── Vue 3 — strict additions ───────────────────────────────────────────
      // Components must be multi-word to avoid clashing with HTML elements
      "vue/multi-word-component-names": "error",
      // Attribute order: directive, v-bind, event, plain
      "vue/attributes-order": ["error", { alphabetical: true }],
      // Enforce component options order
      "vue/order-in-components": "error",
      // No v-html — XSS risk
      "vue/no-v-html": "error",
      // Self-closing tags for void/childless elements
      "vue/html-self-closing": [
        "error",
        {
          html: { void: "always", normal: "always", component: "always" },
          svg: "always",
          math: "always",
        },
      ],
      // Max template attributes per line: 1 = each on its own line
      "vue/max-attributes-per-line": ["error", { singleline: { max: 1 }, multiline: { max: 1 } }],
      // Require emits declarations
      "vue/require-explicit-emits": "error",
      // Require v-bind shorthand (`:prop` not `v-bind:prop`)
      "vue/v-bind-style": "error",
      // Require v-on shorthand (`@event` not `v-on:event`)
      "vue/v-on-style": "error",
      // Enforce defineEmits and defineProps in <script setup>
      "vue/define-macros-order": ["error", { order: ["defineOptions", "defineProps", "defineEmits", "defineSlots"] }],
      // Disallow unused ref declarations
      "vue/no-unused-refs": "error",
      // Disallow side-effects in computed properties
      "vue/no-side-effects-in-computed-properties": "error",
      // Require key on v-for
      "vue/require-v-for-key": "error",
      // Disallow mutation of component props
      "vue/no-mutating-props": "error",

      // ── Unicorn — overrides for Vue/TS conventions ────────────────────────
      // Allow abbreviations common in Vue/TS (props, ref, etc.)
      "unicorn/prevent-abbreviations": [
        "error",
        {
          replacements: {
            props: false,
            ref: false,
            refs: false,
            params: false,
            args: false,
            attr: false,
            attrs: false,
            fn: false,
            cb: false,
            err: false,
            i: false,
            j: false,
          },
        },
      ],
      // Allow null — Vue ecosystem uses null frequently
      "unicorn/no-null": "off",
      // Allow nested ternary — sometimes clearest for template expressions
      "unicorn/no-nested-ternary": "off",
      // Allow array reduce — common in data transformation
      "unicorn/no-array-reduce": "off",
      // Filename convention: kebab-case matches Vue SFC convention
      "unicorn/filename-case": [
        "error",
        {
          cases: {
            kebabCase: true,
            pascalCase: true, // Allow PascalCase for Vue components
          },
        },
      ],

      // ── General JS best practices ─────────────────────────────────────────
      // Disable base no-undef — use @typescript-eslint/no-undef for type-aware linting
      "no-undef": "off",
      // TypeScript no-undef handles autoimports and global types
      "@typescript-eslint/no-undef": "error",
      // No console.log in production code
      "no-console": ["error", { allow: ["warn", "error"] }],
      // No debugger statements
      "no-debugger": "error",
      // Prefer const over let when variable is never reassigned
      "prefer-const": "error",
      // No var — use const or let
      "no-var": "error",
      // Require === instead of ==
      eqeqeq: ["error", "always", { null: "ignore" }],
      // Disallow assignment in conditions
      "no-cond-assign": ["error", "always"],
      // Maximum function complexity: 10 paths
      complexity: ["error", { max: 10 }],
      // Maximum function length: 50 lines
      "max-lines-per-function": ["error", { max: 50, skipComments: true, skipBlankLines: true }],
      // Maximum file length: 800 lines
      "max-lines": ["error", { max: 800, skipComments: true, skipBlankLines: true }],
      // Maximum nesting depth: 4 levels
      "max-depth": ["error", { max: 4 }],
      // No magic numbers — use named constants
      "no-magic-numbers": [
        "warn",
        {
          ignore: [-1, 0, 1, 2, 100],
          ignoreArrayIndexes: true,
          ignoreDefaultValues: true,
          ignoreClassFieldInitialValues: true,
        },
      ],
    },
  },

  // ─── Test files — relaxed rules ───────────────────────────────────────────
  {
    files: ["**/*.spec.ts", "**/*.test.ts", "**/__tests__/**/*.ts"],
    rules: {
      // Tests regularly use magic numbers for assertions
      "no-magic-numbers": "off",
      // Test files can be longer
      "max-lines": "off",
      "max-lines-per-function": "off",
      // Tests often need any for mocking
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      // Complexity in describe blocks can be naturally higher
      complexity: "off",
    },
  },

  // ─── Disable type-checked rules for JS config files ─────────────────────
  {
    files: ["*.config.js", "*.config.mjs", "*.config.cjs", ".eslintrc.*"],
    ...ts.configs.disableTypeChecked,
  },

  // ─── Config files — Node environment ─────────────────────────────────────
  {
    files: ["*.config.{ts,js}", ".eslintrc.*"],
    rules: {
      // Config files legitimately use default exports and require
      "unicorn/prefer-module": "off",
    },
  },

  // ─── Prettier must be LAST to override all formatting rules ───────────────
  prettierConfig,
);

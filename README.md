# @amurisavemylifee/shared-config

🚀 **Production-grade ESLint, Prettier, and TypeScript configurations** for Vue 3, TypeScript, and Node.js projects.

One strict config to rule them all — install once, update everywhere.

## Features

- ✅ **Maximum TypeScript strictness** — `noUncheckedIndexedAccess`, `noImplicitReturns`, `noImplicitOverride`, etc.
- ✅ **Semantic import sorting** — Groups by: Node.js → external → internal → relative → side-effects
- ✅ **Vue 3 strongly-recommended rules** — All best practices enforced
- ✅ **SonarJS + Unicorn** — Catch code smells, enforce modern JavaScript idioms
- ✅ **Function/file size limits** — Keep code maintainable (50 lines/function, 800 lines/file)
- ✅ **Max nesting depth: 4** — Prevent complexity
- ✅ **Prettier integration** — Single `eslint --fix` handles both linting and formatting
- ✅ **Pre-commit hooks** — Husky + lint-staged for fast checks before pushing

## Prerequisites

- Node.js 18+
- npm 9+ (or yarn/pnpm)
- Git

## Installation (One Command!)

```bash
npm install --save-dev @amurisavemylifee/shared-config && npx shared-config
```

### Step 1: Install the package

```bash
npm install --save-dev @amurisavemylifee/shared-config
```

### Step 2: Run setup

```bash
npx shared-config
```

**This automatically:**

- ✅ Creates config files that inherit from shared-config
- ✅ Copies static files (.editorconfig, .prettierignore)
- ✅ Updates `package.json` with npm scripts
- ✅ Installs dependencies: eslint, prettier, typescript, lint-staged, husky
- ✅ Sets up Husky hooks (pre-commit, pre-push)

### Step 3: Done! Run validation

```bash
npm run validate
```

That's it! 🎉

**Why inheritance?**

- ✅ Updates in shared-config automatically apply to your project
- ✅ No need to re-copy files on version updates
- ✅ Customize by extending the config in your own files

**Need to re-run specific steps?**

```bash
npx shared-config              # Full setup (recommended)
npx shared-config init         # Only create config files
npx shared-config update       # Only update package.json
npx shared-config --help       # Show all available commands
```

### Manual Setup (If npx command doesn't work)

If for some reason the setup didn't run:

```bash
# Create config files that inherit from shared-config
npx shared-config init

# Full setup (includes dependencies and husky)
npx shared-config setup
```

## Verifying Installation

Check that these files exist in your project root:

- ✅ `eslint.config.js` (inherits from @amurisavemylifee/shared-config/eslint)
- ✅ `prettier.config.js` (inherits from @amurisavemylifee/shared-config/prettier)
- ✅ `tsconfig.json` (extends @amurisavemylifee/shared-config/tsconfig)
- ✅ `tsconfig.app.json` (extends @amurisavemylifee/shared-config/tsconfig.app)
- ✅ `tsconfig.node.json` (extends @amurisavemylifee/shared-config/tsconfig.node)
- ✅ `.editorconfig` (copied from package)

And in `package.json`:

- ✅ `scripts` with: lint, lint:fix, format, format:check, type-check, validate, prepare
- ✅ `lint-staged` configuration with file patterns

## Config Files Created

Your project gets three TypeScript configs (like Vite):

**tsconfig.json** - Base config (strict rules, project references):

```json
{
  "extends": "@amurisavemylifee/shared-config/tsconfig",
  "compilerOptions": {
    "composite": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

**tsconfig.app.json** - For browser/Vue apps (with DOM, references base):

```json
{
  "extends": "@amurisavemylifee/shared-config/tsconfig.app",
  "compilerOptions": {
    "composite": true
  },
  "references": [
    { "path": "./tsconfig.json" }
  ],
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"]
}
```

**tsconfig.node.json** - For Node.js (build scripts, tests, references base):

```json
{
  "extends": "@amurisavemylifee/shared-config/tsconfig.node",
  "compilerOptions": {
    "composite": true
  },
  "references": [
    { "path": "./tsconfig.json" }
  ],
  "include": ["vite.config.ts", "vitest.config.ts"]
}
```

**eslint.config.js** - Linting rules:

```javascript
import sharedConfig from "@amurisavemylifee/shared-config/eslint";

export default [...sharedConfig];
```

**prettier.config.js** - Code formatting:

```javascript
import config from "@amurisavemylifee/shared-config/prettier";

export default config;
```

## Quick Start

```bash
# After npm install, configs are already in place!

# Check all files
npm run lint

# Fix violations automatically
npm run lint:fix

# Type check
npm run type-check

# Full validation (all checks)
npm run validate
```

## Configuration

All configs are **production-ready and strict by default**. They are designed to **catch real bugs**, not enforce opinions.

### ESLint Rules (Key ones)

| Rule                            | Purpose                                                  |
| ------------------------------- | -------------------------------------------------------- |
| `no-explicit-any`               | No `any` — use `unknown` with type narrowing             |
| `explicit-function-return-type` | All functions must declare return type                   |
| `explicit-member-accessibility` | All class members need `public`/`private`/`protected`    |
| `no-floating-promises`          | All promises must be `await`ed or explicitly handled     |
| `no-console`                    | No `console.log` in production (only warn/error allowed) |
| `max-lines-per-function: 50`    | Functions must be short and focused                      |
| `max-lines: 800`                | Files must stay under 800 lines                          |
| `max-depth: 4`                  | Maximum nesting depth of 4                               |
| `complexity: 10`                | Function complexity max 10 branches                      |
| `simple-import-sort`            | Semantic import ordering with blank-line groups          |

### TypeScript (Maximum Strictness)

- `strict: true` + `noUncheckedIndexedAccess` — catches unsafe array/object access
- `noImplicitReturns` — all code paths must return
- `noImplicitOverride` — subclasses must explicitly mark overrides
- `verbatimModuleSyntax` — enforces `import type` syntax
- `noUnusedLocals` + `noUnusedParameters` — no dead code

### Prettier (Single Quote, LF Line Endings)

- `printWidth: 130` — plenty of space for readable code
- `singleQuote: false` — use double quotes (matches Vue ecosystem)
- `trailingComma: "all"` — cleaner diffs
- `endOfLine: "lf"` — Unix line endings (Windows-safe with git config)
- `singleAttributePerLine: true` — Vue templates have one attribute per line

## Import Sorting Groups

Imports are automatically sorted into semantic groups with blank lines between:

```typescript
// [0] Node.js built-ins
import { readFile } from "fs";
import { join } from "path";

// [1] External libraries
import { createApp } from "vue";
import { createPinia } from "pinia";
import axios from "axios";

// [2] Type-only external imports
import type { Ref } from "vue";

// [3] Absolute internal (non-components)
import { useStore } from "@/store";
import { getErrorMessage } from "@/utils/error";

// [4] Component imports (absolute)
import MyComponent from "@/components/MyComponent.vue";

// [5] Relative imports
import { helper } from "../utils";
import { sibling } from "./sibling";

// [6] Side-effects & CSS (last!)
import "./styles.css";
import "reflect-metadata";
```

## Customizing Inherited Configs

You can extend the inherited configs in your project:

**eslint.config.js - Add custom rules:**

```javascript
import sharedConfig from "@amurisavemylifee/shared-config/eslint";
import customPlugin from "custom-eslint-plugin";

export default [
  ...sharedConfig,
  {
    plugins: { customPlugin },
    rules: { "custom-plugin/rule": "warn" },
  },
];
```

**prettier.config.js - Override options:**

```javascript
import config from "@amurisavemylifee/shared-config/prettier";

export default {
  ...config,
  printWidth: 100, // Override specific option
};
```

**tsconfig.json** (Base with project references):

```json
{
  "extends": "@amurisavemylifee/shared-config/tsconfig",
  "compilerOptions": {
    "composite": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

**tsconfig.app.json** (Browser/Vue, references base):

```json
{
  "extends": "@amurisavemylifee/shared-config/tsconfig.app",
  "compilerOptions": {
    "composite": true
  },
  "references": [
    { "path": "./tsconfig.json" }
  ],
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"]
}
```

**tsconfig.node.json** (Node.js, references base):

```json
{
  "extends": "@amurisavemylifee/shared-config/tsconfig.node",
  "compilerOptions": {
    "composite": true
  },
  "references": [
    { "path": "./tsconfig.json" }
  ],
  "include": ["vite.config.ts", "vitest.config.ts"]
}
```

## Troubleshooting

### Pre-commit hook not running

```bash
# Reinitialize Husky
npx husky install

# Verify hooks were created
ls -la .husky/
```

## Updates & Publishing

### Updating shared-config

To update all your projects at once:

```bash
npm update @amurisavemylifee/shared-config
```

The inherited configs automatically use the updated rules from the package. No need to re-copy files or update anything else!

**To improve the config:**

1. Edit `eslint.config.js`, `prettier.config.js`, `tsconfig.node.json`, or `tsconfig.app.json`
2. Bump version in `package.json` (`npm version minor` or `npm version patch`)
3. Commit and push
4. Create a GitHub Release (auto-publishes with GitHub Actions)

**In your projects:**

```bash
npm update @amurisavemylifee/shared-config
```

## Issues

Found a bug or have a suggestion? Open an issue on [GitHub](https://github.com/amurisavemylifee/shared-config/issues).

## License

MIT — use freely in personal and commercial projects.

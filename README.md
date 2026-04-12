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

## Installation (One Command!)

```bash
npm install --save-dev @amurisavemylifee/shared-config && npx shared-config
```

### What it does:

```bash
npx shared-config
```

**This will:**
- ✅ Create config files that inherit from shared-config (ESLint, Prettier, TypeScript)
- ✅ Copy static files (.editorconfig, .prettierignore)
- ✅ Add npm scripts to package.json (lint, type-check, validate, etc.)
- ✅ Install dependencies (eslint, prettier, typescript, lint-staged, husky)
- ✅ Setup Husky hooks (pre-commit, pre-push)

### 3. Done! Run validation

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

| Rule | Purpose |
|------|---------|
| `no-explicit-any` | No `any` — use `unknown` with type narrowing |
| `explicit-function-return-type` | All functions must declare return type |
| `explicit-member-accessibility` | All class members need `public`/`private`/`protected` |
| `no-floating-promises` | All promises must be `await`ed or explicitly handled |
| `no-console` | No `console.log` in production (only warn/error allowed) |
| `max-lines-per-function: 50` | Functions must be short and focused |
| `max-lines: 800` | Files must stay under 800 lines |
| `max-depth: 4` | Maximum nesting depth of 4 |
| `complexity: 10` | Function complexity max 10 branches |
| `simple-import-sort` | Semantic import ordering with blank-line groups |

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

## Updates

To update all your projects at once:

```bash
npm update @amurisavemylifee/shared-config
```

Then copy the updated config files (or re-run the setup script).

## Issues

Found a bug or have a suggestion? Open an issue on [GitHub](https://github.com/amurisavemylifee/shared-config/issues).

## License

MIT — use freely in personal and commercial projects.

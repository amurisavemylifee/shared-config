# Setup Guide for @amurisavemylifee/shared-config

Fast setup guide for adding this strict config to your project.

## Prerequisites

- Node.js 18+
- npm 9+ (or yarn/pnpm)
- Git

## Automatic Setup

### Step 1: Install the package

```bash
npm install --save-dev @amurisavemylifee/shared-config
```

### Step 2: Run setup

```bash
npx shared-config
```

**This automatically:**
- Creates config files that inherit from shared-config
- Copies static files (.editorconfig, .prettierignore)
- Updates `package.json` with npm scripts
- Installs dependencies: eslint, prettier, typescript, lint-staged, husky
- Sets up Husky hooks

### Step 3: Done! Run validation

```bash
npm run validate
```

That's it! 🎉

**Or as one command:**
```bash
npm install --save-dev @amurisavemylifee/shared-config && npx shared-config
```

## How It Works

Your config files inherit from the package:

**eslint.config.js:**
```javascript
import sharedConfig from '@amurisavemylifee/shared-config/eslint';

export default [
  ...sharedConfig,
  // Add your custom rules here
];
```

**prettier.config.js:**
```javascript
import config from '@amurisavemylifee/shared-config/prettier';

export default config;
// Or override specific options:
// export default { ...config, printWidth: 100 };
```

**tsconfig.json** (Node.js - tests, build, scripts):
```json
{
  "extends": "@amurisavemylifee/shared-config/tsconfig.node",
  "compilerOptions": {}
}
```

**tsconfig.app.json** (Browser/Vue app):
```json
{
  "extends": "@amurisavemylifee/shared-config/tsconfig.app",
  "compilerOptions": {
    "outDir": "./dist"
  }
}
```

**Benefits:**
- ✅ Two separate TypeScript configs (Node vs App)
- ✅ Updates in shared-config automatically apply to all projects
- ✅ No need to re-copy files when updating the package
- ✅ Easy to customize by extending the inherited config
- ✅ Single source of truth for standards

## Manual Setup (If npx command doesn't work)

If for some reason the postinstall script didn't run:

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
- ✅ `tsconfig.json` (extends @amurisavemylifee/shared-config/tsconfig.node)
- ✅ `tsconfig.app.json` (extends @amurisavemylifee/shared-config/tsconfig.app)
- ✅ `.editorconfig` (copied from package)

And in `package.json`:
- ✅ `scripts` with: lint, lint:fix, format, format:check, type-check, validate, prepare
- ✅ `lint-staged` configuration with file patterns

## Customizing Inherited Configs

You can extend the inherited configs in your project:

**eslint.config.js - Add custom rules:**
```javascript
import sharedConfig from '@amurisavemylifee/shared-config/eslint';
import customPlugin from 'custom-eslint-plugin';

export default [
  ...sharedConfig,
  {
    plugins: { customPlugin },
    rules: { 'custom-plugin/rule': 'warn' },
  },
];
```

**prettier.config.js - Override options:**
```javascript
import config from '@amurisavemylifee/shared-config/prettier';

export default {
  ...config,
  printWidth: 100, // Override specific option
};
```

**tsconfig.json** (Node.js):
```json
{
  "extends": "@amurisavemylifee/shared-config/tsconfig.node",
  "compilerOptions": {
    "outDir": "./dist"
  }
}
```

**tsconfig.app.json** (Browser/Vue):
```json
{
  "extends": "@amurisavemylifee/shared-config/tsconfig.app",
  "compilerOptions": {
    "outDir": "./dist",
    "declaration": true
  },
  "include": ["src/**/*"]
}
```

## Publishing to GitHub Packages

### Step 1: Create GitHub Personal Access Token

1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Select scopes: `write:packages` and `read:packages`
4. Save the token

### Step 2: Configure npm authentication

Create or update `~/.npmrc`:

```
@amurisavemylifee:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN_HERE
```

Replace `YOUR_GITHUB_TOKEN_HERE` with your token.

### Step 3: Create & push GitHub repository

```bash
git init
git add .
git commit -m "feat: initial commit"
git branch -M main
git remote add origin https://github.com/amurisavemylifee/shared-config.git
git push -u origin main
```

### Step 4: Publish to GitHub Packages

```bash
npm publish
```

✅ Package is now available at `@amurisavemylifee/shared-config`!

GitHub Actions will auto-publish on releases (config already in `.github/workflows/publish.yml`).

### Step 5: Update projects with new versions

After improving the config:

```bash
# In shared-config repo:
# - Edit eslint.config.js, prettier.config.js, etc.
# - Bump version: 1.0.0 → 1.0.1
git add .
git commit -m "fix: improve rule X"
git push

# Create release on GitHub (auto-publishes via GitHub Actions)

# In your projects:
npm update @amurisavemylifee/shared-config
npm run validate
```

The postinstall hook handles updating files automatically! ✅

## Updating the Config

**In the shared-config repo:**

1. Update `eslint.config.js`, `prettier.config.js`, `tsconfig.node.json`, or `tsconfig.app.json`
2. Bump version in `package.json` (`npm version minor` or `npm version patch`)
3. Commit and push
4. Create a GitHub Release (auto-publishes with GitHub Actions)

**In your projects:**

```bash
npm update @amurisavemylifee/shared-config
```

✅ **That's it!** Your inherited configs automatically use the updated rules from the package. No need to re-copy files or update anything else!

## Troubleshooting

### ESLint Error: "Cannot find module"

Make sure `tsconfigRootDir` in `eslint.config.js` points to your project root. If the config was copied correctly, it should be:

```javascript
tsconfigRootDir: import.meta.dirname,
```

### TypeScript errors on `import.meta`

Add to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "lib": ["ES2022", "DOM", "DOM.Iterable"]
  }
}
```

### Pre-commit hook not running

```bash
# Reinitialize Husky
npx husky install

# Verify hooks were created
ls -la .husky/
```

### Import sorting not working

Run:

```bash
npm run lint:fix
```

This auto-fixes all import order violations.

## Need help?

- Check the [README.md](./README.md) for feature details
- Open an issue on [GitHub](https://github.com/amurisavemylifee/shared-config/issues)

# Setup Guide for @amurisavemylifee/shared-config

Fast setup guide for adding this strict config to your project.

## Prerequisites

- Node.js 18+
- npm 9+ (or yarn/pnpm)
- Git

## Automatic Setup (Recommended)

### Step 1: Install package

```bash
npm install --save-dev @amurisavemylifee/shared-config
```

✅ **Config files are automatically copied!** The postinstall script handles it.

### Step 2: Update package.json with scripts

**Option A - Let CLI do it:**
```bash
npx shared-config update-package-json
```

**Option B - Do it manually:**

Add to `package.json`:
```json
{
  "scripts": {
    "lint": "eslint . --max-warnings 0",
    "lint:fix": "eslint . --fix --max-warnings 0",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "type-check": "tsc --build",
    "validate": "npm run type-check && npm run lint && npm run format:check",
    "prepare": "husky"
  },
  "lint-staged": {
    "*.{ts,tsx,vue}": ["eslint --fix --max-warnings 0", "prettier --write"],
    "*.{js,mjs,cjs}": ["eslint --fix --max-warnings 0", "prettier --write"],
    "*.{css,scss,html}": ["prettier --write"],
    "*.{json,md,yaml,yml}": ["prettier --write"]
  }
}
```

### Step 3: Set up Husky hooks

```bash
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
npx husky add .husky/pre-push "npm run type-check"
```

### Step 4: Validate

```bash
npm run lint:fix
npm run type-check
```

Done! 🎉

## Manual Setup (If postinstall doesn't work)

If for some reason the postinstall script didn't run:

```bash
npx shared-config init
```

This manually copies all config files.

## Verifying Installation

Check that these files exist in your project root:
- ✅ `eslint.config.js`
- ✅ `prettier.config.js`
- ✅ `tsconfig.json`
- ✅ `.editorconfig`
- ✅ `.prettierignore`

And in `package.json`:
- ✅ `scripts` with lint, type-check, etc.
- ✅ `lint-staged` configuration

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

When you improve the config:

1. Update `eslint.config.js`, `prettier.config.js`, or `tsconfig.json` in the shared-config repo
2. Bump version in `package.json`
3. Commit and push
4. Create a GitHub Release (auto-publishes with GitHub Actions)
5. In each project: `npm update @amurisavemylifee/shared-config && node .setup-shared-config.js`

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

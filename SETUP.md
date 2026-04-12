# Setup Guide for @amurisavemylifee/shared-config

Fast setup guide for adding this strict config to your project.

## Prerequisites

- Node.js 18+
- npm 9+ (or yarn/pnpm)
- Git

## Automatic Setup (One Command!)

### Step 1: Install package

```bash
npm install --save-dev @amurisavemylifee/shared-config
```

✅ **EVERYTHING HAPPENS AUTOMATICALLY!** The postinstall script:
- Copies all config files (only if they don't already exist)
- Updates `package.json` with npm scripts
- Adds lint-staged configuration

### Step 2: Install peer dependencies

```bash
npm install --save-dev eslint prettier typescript lint-staged husky
```

### Step 3: Set up Husky hooks

```bash
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
npx husky add .husky/pre-push "npm run type-check"
```

### Step 4: Done! Run validation

```bash
npm run validate
```

That's it! 🎉

## Manual Setup (If postinstall doesn't work)

If for some reason the postinstall script didn't run:

```bash
# Copy config files to project
npx shared-config

# Update package.json with scripts
npx shared-config update
```

## Verifying Installation

Check that these files exist in your project root:
- ✅ `eslint.config.js`
- ✅ `prettier.config.js`
- ✅ `tsconfig.json`
- ✅ `.editorconfig`
- ✅ `.prettierignore`

And in `package.json`:
- ✅ `scripts` with: lint, lint:fix, format, format:check, type-check, validate, prepare
- ✅ `lint-staged` configuration with file patterns

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
5. In each project: `npm update @amurisavemylifee/shared-config`

The postinstall hook automatically copies updated config files and updates package.json scripts! ✅

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

#!/usr/bin/env node

import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packageDir = resolve(__dirname, '..');
const projectDir = process.cwd();

const command = process.argv[2];

const configStubs = [
  {
    dest: 'eslint.config.js',
    content: `import sharedConfig from '@amurisavemylifee/shared-config/eslint';

export default [
  ...sharedConfig,
];
`,
  },
  {
    dest: 'prettier.config.js',
    content: `import config from '@amurisavemylifee/shared-config/prettier';

export default config;
`,
  },
  {
    dest: 'tsconfig.json',
    content: `{
  "extends": "@amurisavemylifee/shared-config/tsconfig"
}
`,
  },
  {
    dest: 'tsconfig.app.json',
    content: `{
  "extends": "@amurisavemylifee/shared-config/tsconfig.app",
  "include": ["src"]
}
`,
  },
  {
    dest: 'tsconfig.node.json',
    content: `{
  "extends": "@amurisavemylifee/shared-config/tsconfig.node",
  "include": ["vite.config.ts", "vitest.config.ts"]
}
`,
  },
  {
    dest: '.editorconfig',
    src: '.editorconfig',
    copy: true,
  },
];

function createConfigFiles() {
  console.log('\n🚀 Setting up config files...\n');

  configStubs.forEach(({ dest, content, src, copy }) => {
    const destPath = join(projectDir, dest);

    try {
      if (existsSync(destPath)) {
        console.log(`⏭️  ${dest} already exists`);
        return;
      }

      if (copy && src) {
        // Copy files that don't support inheritance (.editorconfig, .prettierignore)
        const srcPath = join(packageDir, src);
        copyFileSync(srcPath, destPath);
        console.log(`✅ Copied ${dest}`);
      } else {
        // Create config stubs that inherit from shared-config package
        writeFileSync(destPath, content);
        console.log(`✅ Created ${dest} (inherits from shared-config)`);
      }
    } catch (error) {
      console.error(`❌ Error creating ${dest}:`, error.message);
    }
  });
}

function updatePackageJson() {
  const packageJsonPath = join(projectDir, 'package.json');

  if (!existsSync(packageJsonPath)) {
    console.error('❌ package.json not found');
    process.exit(1);
  }

  try {
    console.log('\n📝 Updating package.json...\n');

    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

    // Добавляем скрипты (только новые, не перезаписываем существующие)
    packageJson.scripts = packageJson.scripts || {};
    const scriptsToAdd = {
      lint: 'eslint . --max-warnings 0',
      'lint:fix': 'eslint . --fix --max-warnings 0',
      format: 'prettier --write .',
      'format:check': 'prettier --check .',
      'type-check': 'tsc --build',
      validate: 'npm run type-check && npm run lint && npm run format:check',
      prepare: 'husky',
    };

    let scriptsAdded = 0;
    Object.entries(scriptsToAdd).forEach(([key, value]) => {
      if (!packageJson.scripts[key]) {
        packageJson.scripts[key] = value;
        console.log(`✅ Added script: ${key}`);
        scriptsAdded++;
      } else {
        console.log(`⏭️  Script already exists: ${key}`);
      }
    });

    // Добавляем lint-staged конфиг (если его нет)
    if (!packageJson['lint-staged']) {
      packageJson['lint-staged'] = {
        '*.{ts,tsx,vue}': ['eslint --fix --max-warnings 0', 'prettier --write'],
        '*.{js,mjs,cjs}': ['eslint --fix --max-warnings 0', 'prettier --write'],
        '*.{css,scss,html}': ['prettier --write'],
        '*.{json,md,yaml,yml}': ['prettier --write'],
      };
      console.log('✅ Added lint-staged configuration');
    } else {
      console.log('⏭️  lint-staged configuration already exists');
    }

    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
    return scriptsAdded > 0;
  } catch (error) {
    console.error(`❌ Error updating package.json:`, error.message);
    process.exit(1);
  }
}

function installDependencies() {
  console.log('\n📦 Installing dependencies...\n');

  const dependencies = [
    'eslint',
    'prettier',
    'typescript',
    'lint-staged',
    'husky',
  ];

  try {
    execSync(`npm install --save-dev ${dependencies.join(' ')}`, {
      cwd: projectDir,
      stdio: 'inherit',
    });
    console.log('\n✅ Dependencies installed');
    return true;
  } catch (error) {
    console.error(`❌ Error installing dependencies:`, error.message);
    return false;
  }
}

function setupHusky() {
  console.log('\n🐶 Setting up Husky...\n');

  try {
    // Initialize husky
    execSync('npx husky install', {
      cwd: projectDir,
      stdio: 'inherit',
    });

    // Add pre-commit hook
    execSync('npx husky add .husky/pre-commit "npx lint-staged"', {
      cwd: projectDir,
      stdio: 'inherit',
    });

    // Add pre-push hook
    execSync('npx husky add .husky/pre-push "npm run type-check"', {
      cwd: projectDir,
      stdio: 'inherit',
    });

    console.log('\n✅ Husky setup complete');
    return true;
  } catch (error) {
    console.error(`⚠️  Error setting up Husky:`, error.message);
    console.log('You can set it up manually later with:');
    console.log('  npx husky install');
    console.log('  npx husky add .husky/pre-commit "npx lint-staged"');
    console.log('  npx husky add .husky/pre-push "npm run type-check"\n');
    return false;
  }
}

async function fullSetup() {
  console.log('\n🚀 Running complete setup...\n');

  // Step 1: Create config stubs that inherit from shared-config
  createConfigFiles();

  // Step 2: Update package.json
  updatePackageJson();

  // Step 3: Install dependencies
  const depsInstalled = installDependencies();

  if (depsInstalled) {
    // Step 4: Setup Husky
    setupHusky();
  }

  console.log('\n✨ Setup complete!\n');
  console.log('You can now run:');
  console.log('  npm run validate     - Run all checks');
  console.log('  npm run lint:fix     - Auto-fix linting issues');
  console.log('  npm run type-check   - Check types\n');
}

(async () => {
  if (command === 'setup' || !command) {
    await fullSetup();
  } else if (command === 'init') {
    createConfigFiles();
    console.log('\n✨ Run "npx shared-config setup" to complete setup\n');
  } else if (command === 'update-package-json' || command === 'update') {
    const updated = updatePackageJson();
    console.log('\n✅ Done!\n');
    if (updated) {
      console.log('Next steps:');
      console.log('  npm run validate\n');
    }
  } else if (command === '--help' || command === '-h') {
    console.log(`
Usage: npx shared-config [command]

Commands:
  setup                   Full setup: copy configs, update package.json, install dependencies, setup Husky (default)
  init                    Copy config files to project only
  update-package-json     Update package.json with scripts and config
  update                  Alias for update-package-json
  --help, -h             Show this help message

Examples:
  npx shared-config              # Full setup (recommended)
  npx shared-config setup        # Same as above
  npx shared-config init         # Only copy config files
  npx shared-config update       # Only update package.json
`);
  } else {
    console.error(`❌ Unknown command: ${command}`);
    console.log('Run: npx shared-config --help\n');
    process.exit(1);
  }
})();

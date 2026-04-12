#!/usr/bin/env node

import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packageDir = resolve(__dirname, '..');
const projectDir = process.cwd();

const command = process.argv[2];

async function setupConfigs() {
  const filesToCopy = [
    { src: 'eslint.config.js', dest: 'eslint.config.js' },
    { src: 'prettier.config.js', dest: 'prettier.config.js' },
    { src: 'tsconfig.json', dest: 'tsconfig.json' },
    { src: '.editorconfig', dest: '.editorconfig' },
    { src: '.prettierignore', dest: '.prettierignore' },
  ];

  console.log('\n🚀 Setting up @amurisavemylifee/shared-config\n');

  filesToCopy.forEach(({ src, dest }) => {
    const srcPath = join(packageDir, src);
    const destPath = join(projectDir, dest);

    try {
      if (existsSync(destPath)) {
        console.log(`⏭️  ${dest} already exists`);
        return;
      }

      copyFileSync(srcPath, destPath);
      console.log(`✅ Created ${dest}`);
    } catch (error) {
      console.error(`❌ Error copying ${dest}:`, error.message);
    }
  });

  console.log('\n✨ Next steps:\n');
  console.log('1. Add npm scripts to package.json:');
  console.log('   npm set-script lint "eslint . --max-warnings 0"');
  console.log('   npm set-script lint:fix "eslint . --fix --max-warnings 0"');
  console.log('   npm set-script format "prettier --write ."');
  console.log('   npm set-script type-check "tsc --build"');
  console.log('   npm set-script validate "npm run type-check && npm run lint && npm run format:check"\n');

  console.log('2. Add lint-staged to package.json:');
  console.log('   npm set-script prepare "husky"\n');

  console.log('3. Setup Husky hooks:');
  console.log('   npx husky install');
  console.log('   npx husky add .husky/pre-commit "npx lint-staged"');
  console.log('   npx husky add .husky/pre-push "npm run type-check"\n');

  console.log('4. Run validation:');
  console.log('   npm run lint:fix && npm run type-check\n');
}

async function updatePackageJson() {
  const packageJsonPath = join(projectDir, 'package.json');

  if (!existsSync(packageJsonPath)) {
    console.error('❌ package.json not found');
    process.exit(1);
  }

  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

  // Add scripts
  packageJson.scripts = packageJson.scripts || {};
  Object.assign(packageJson.scripts, {
    lint: 'eslint . --max-warnings 0',
    'lint:fix': 'eslint . --fix --max-warnings 0',
    format: 'prettier --write .',
    'format:check': 'prettier --check .',
    'type-check': 'tsc --build',
    validate: 'npm run type-check && npm run lint && npm run format:check',
    prepare: 'husky',
  });

  // Add lint-staged
  packageJson['lint-staged'] = {
    '*.{ts,tsx,vue}': ['eslint --fix --max-warnings 0', 'prettier --write'],
    '*.{js,mjs,cjs}': ['eslint --fix --max-warnings 0', 'prettier --write'],
    '*.{css,scss,html}': ['prettier --write'],
    '*.{json,md,yaml,yml}': ['prettier --write'],
  };

  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  console.log('✅ Updated package.json with scripts and lint-staged config');
}

if (command === 'init' || !command) {
  await setupConfigs();
  console.log('ℹ️  Automatically setup: configs copied\n');
  console.log('Would you like me to also update package.json with npm scripts? (y/n)');
  console.log('(You can run this later: npx shared-config update-package-json)\n');
} else if (command === 'update-package-json') {
  await updatePackageJson();
  console.log('\n✅ All set! Run: npm run validate\n');
} else if (command === '--help' || command === '-h') {
  console.log(`
Usage: npx shared-config [command]

Commands:
  init                    Copy config files (default)
  update-package-json     Update package.json with scripts
  --help, -h             Show this help message

Examples:
  npx shared-config init
  npx shared-config update-package-json
`);
} else {
  console.error(`❌ Unknown command: ${command}`);
  console.log('Run: npx shared-config --help');
  process.exit(1);
}

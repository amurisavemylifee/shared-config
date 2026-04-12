#!/usr/bin/env node

import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packageDir = resolve(__dirname, '..');
const projectDir = process.cwd();

const command = process.argv[2];

const filesToCopy = [
  { src: 'eslint.config.js', dest: 'eslint.config.js' },
  { src: 'prettier.config.js', dest: 'prettier.config.js' },
  { src: 'tsconfig.json', dest: 'tsconfig.json' },
  { src: '.editorconfig', dest: '.editorconfig' },
  { src: '.prettierignore', dest: '.prettierignore' },
];

function copyConfigFiles() {
  console.log('\n🚀 Copying config files...\n');

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

if (command === 'init' || !command) {
  copyConfigFiles();
  console.log('\n✨ Run "npx shared-config update-package-json" to add npm scripts\n');
} else if (command === 'update-package-json' || command === 'update') {
  const updated = updatePackageJson();
  console.log('\n✅ Done!\n');
  if (updated) {
    console.log('Next steps:');
    console.log('  1. Install peer dependencies:');
    console.log('     npm install --save-dev eslint prettier typescript');
    console.log('  2. Install linting tools:');
    console.log('     npm install --save-dev lint-staged husky');
    console.log('  3. Initialize Husky:');
    console.log('     npx husky install');
    console.log('  4. Add git hooks:');
    console.log('     npx husky add .husky/pre-commit "npx lint-staged"');
    console.log('     npx husky add .husky/pre-push "npm run type-check"');
    console.log('  5. Run validation:');
    console.log('     npm run validate\n');
  }
} else if (command === '--help' || command === '-h') {
  console.log(`
Usage: npx shared-config [command]

Commands:
  init                    Copy config files to project (default)
  update-package-json     Update package.json with scripts and config
  update                  Alias for update-package-json
  --help, -h             Show this help message

Examples:
  npx shared-config
  npx shared-config init
  npx shared-config update-package-json
`);
} else {
  console.error(`❌ Unknown command: ${command}`);
  console.log('Run: npx shared-config --help\n');
  process.exit(1);
}

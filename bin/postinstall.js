#!/usr/bin/env node

import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Узнаем где установлен пакет (node_modules/@amurisavemylifee/shared-config)
const packageDir = resolve(__dirname, '..');

// Узнаем где находится проект (рабочая директория)
const projectDir = process.cwd();

// Если мы в самом пакете (при разработке), не копируем
if (packageDir === projectDir) {
  console.log('⏭️  Skipping postinstall in shared-config package directory');
  process.exit(0);
}

const filesToCopy = [
  { src: 'eslint.config.js', dest: 'eslint.config.js' },
  { src: 'prettier.config.js', dest: 'prettier.config.js' },
  { src: 'tsconfig.json', dest: 'tsconfig.json' },
  { src: '.editorconfig', dest: '.editorconfig' },
  { src: '.prettierignore', dest: '.prettierignore' },
];

function copyConfigFiles() {
  console.log('\n✨ Setting up @amurisavemylifee/shared-config...\n');

  filesToCopy.forEach(({ src, dest }) => {
    const srcPath = join(packageDir, src);
    const destPath = join(projectDir, dest);

    // Проверяем существует ли файл (пропускаем если уже есть, чтобы не перезаписать)
    if (existsSync(destPath)) {
      console.log(`⏭️  ${dest} already exists (skipped)`);
      return;
    }

    try {
      copyFileSync(srcPath, destPath);
      console.log(`✅ ${dest}`);
    } catch (error) {
      console.warn(`⚠️  Failed to copy ${dest}: ${error.message}`);
    }
  });
}

function updatePackageJson() {
  const packageJsonPath = join(projectDir, 'package.json');

  if (!existsSync(packageJsonPath)) {
    console.warn('⚠️  package.json not found, skipping scripts setup');
    return false;
  }

  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

    // Добавляем скрипты
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

    // Добавляем только новые скрипты (не перезаписываем существующие)
    Object.entries(scriptsToAdd).forEach(([key, value]) => {
      if (!packageJson.scripts[key]) {
        packageJson.scripts[key] = value;
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
    }

    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
    console.log('✅ Updated package.json with scripts and lint-staged config');
    return true;
  } catch (error) {
    console.warn(`⚠️  Failed to update package.json: ${error.message}`);
    return false;
  }
}

try {
  // Копируем конфиги
  copyConfigFiles();

  // Обновляем package.json
  updatePackageJson();

  console.log('\n✅ Setup complete!\n');
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
} catch (error) {
  console.error('❌ Error during setup:', error.message);
  process.exit(1);
}

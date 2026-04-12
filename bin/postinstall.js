#!/usr/bin/env node

import { copyFileSync, existsSync, mkdirSync } from 'fs';
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

try {
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

  console.log('\n✅ Config setup complete!\n');
  console.log('Next steps:');
  console.log('  1. Add npm scripts to package.json:');
  console.log('     - npm run lint');
  console.log('     - npm run lint:fix');
  console.log('     - npm run type-check');
  console.log('  2. Set up Husky: npx husky install');
  console.log('  3. Run: npm run lint:fix\n');
} catch (error) {
  console.error('❌ Error during setup:', error.message);
  process.exit(1);
}

#!/usr/bin/env node

import { copyFileSync, existsSync } from 'fs';
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
  console.log('\n✨ @amurisavemylifee/shared-config installed\n');

  filesToCopy.forEach(({ src, dest }) => {
    const srcPath = join(packageDir, src);
    const destPath = join(projectDir, dest);

    if (existsSync(destPath)) {
      console.log(`⏭️  ${dest} already exists`);
      return;
    }

    try {
      copyFileSync(srcPath, destPath);
      console.log(`✅ ${dest}`);
    } catch (error) {
      console.warn(`⚠️  Failed to copy ${dest}: ${error.message}`);
    }
  });

  console.log('\n🚀 Next step: run setup\n');
  console.log('  npx shared-config\n');
  console.log('This will:');
  console.log('  ✓ Ensure all config files are in place');
  console.log('  ✓ Add npm scripts to package.json');
  console.log('  ✓ Install dependencies (eslint, prettier, typescript, husky, lint-staged)');
  console.log('  ✓ Setup Husky git hooks\n');
} catch (error) {
  console.error('❌ Error during postinstall:', error.message);
  process.exit(1);
}

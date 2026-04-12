#!/usr/bin/env node

import { copyFileSync, existsSync, writeFileSync } from 'fs';
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
  "extends": "@amurisavemylifee/shared-config/tsconfig",
  "compilerOptions": {}
}
`,
  },
  {
    dest: '.editorconfig',
    src: '.editorconfig',
    copy: true,
  },
  {
    dest: '.prettierignore',
    src: '.prettierignore',
    copy: true,
  },
];

try {
  console.log('\n✨ @amurisavemylifee/shared-config installed\n');

  configStubs.forEach(({ dest, content, src, copy }) => {
    const destPath = join(projectDir, dest);

    if (existsSync(destPath)) {
      console.log(`⏭️  ${dest} already exists`);
      return;
    }

    try {
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
      console.warn(`⚠️  Failed to create ${dest}: ${error.message}`);
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

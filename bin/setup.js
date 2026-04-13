#!/usr/bin/env node

import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join, resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packageDir = resolve(__dirname, "..");
const projectDir = process.cwd();

const command = process.argv[2];

const configStubs = [
  {
    dest: "eslint.config.js",
    template: "eslint.config.js",
  },
  {
    dest: "prettier.config.js",
    template: "prettier.config.js",
  },
  {
    dest: "tsconfig.json",
    template: "tsconfig.json",
  },
  {
    dest: "tsconfig.app.json",
    template: "tsconfig.app.json",
  },
  {
    dest: "tsconfig.node.json",
    template: "tsconfig.node.json",
  },
  {
    dest: ".editorconfig",
    src: ".editorconfig",
    copy: true,
  },
];

function createConfigFiles() {
  console.log("\n🚀 Setting up config files...\n");

  configStubs.forEach(({ dest, template, src, copy }) => {
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
      } else if (template) {
        // Create config stubs that inherit from shared-config package
        const templatePath = join(__dirname, "templates", template);
        const content = readFileSync(templatePath, "utf-8");
        writeFileSync(destPath, content);
        console.log(`✅ Created ${dest} (inherits from shared-config)`);
      }
    } catch (error) {
      console.error(`❌ Error creating ${dest}:`, error.message);
    }
  });
}

function updatePackageJson() {
  const packageJsonPath = join(projectDir, "package.json");

  if (!existsSync(packageJsonPath)) {
    console.error("❌ package.json not found");
    process.exit(1);
  }

  try {
    console.log("\n📝 Updating package.json...\n");

    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));

    // Добавляем скрипты (только новые, не перезаписываем существующие)
    packageJson.scripts = packageJson.scripts || {};
    const scriptsToAdd = {
      lint: "eslint . --max-warnings 0",
      "lint:fix": "eslint . --fix --max-warnings 0",
      format: "prettier --write .",
      "format:check": "prettier --check .",
      "type-check": "tsc --build",
      validate: "npm run type-check && npm run lint && npm run format:check",
      prepare: "husky",
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
    if (!packageJson["lint-staged"]) {
      packageJson["lint-staged"] = {
        "*.{ts,tsx,vue}": ["eslint --fix --max-warnings 0", "prettier --write"],
        "*.{js,mjs,cjs}": ["eslint --fix --max-warnings 0", "prettier --write"],
        "*.{css,scss,html}": ["prettier --write"],
        "*.{json,md,yaml,yml}": ["prettier --write"],
      };
      console.log("✅ Added lint-staged configuration");
    } else {
      console.log("⏭️  lint-staged configuration already exists");
    }

    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + "\n");
    return scriptsAdded > 0;
  } catch (error) {
    console.error(`❌ Error updating package.json:`, error.message);
    process.exit(1);
  }
}

function installDependencies() {
  console.log("\n📦 Installing dependencies...\n");

  const dependencies = ["eslint", "prettier", "typescript", "lint-staged", "husky"];

  try {
    execSync(`npm install --save-dev ${dependencies.join(" ")}`, {
      cwd: projectDir,
      stdio: "inherit",
    });
    console.log("\n✅ Dependencies installed");
    return true;
  } catch (error) {
    console.error(`❌ Error installing dependencies:`, error.message);
    return false;
  }
}

function setupHusky() {
  console.log("\n🐶 Setting up Husky...\n");

  try {
    // Initialize husky
    try {
      execSync("npx husky install", {
        cwd: projectDir,
        stdio: "pipe",
      });
    } catch (e) {
      // husky install might show deprecation but still work
    }

    // Create .husky directory if it doesn't exist
    const huskyDir = join(projectDir, ".husky");
    if (!existsSync(huskyDir)) {
      mkdirSync(huskyDir, { recursive: true });
    }

    // Create pre-commit hook
    const preCommitHook = join(huskyDir, "pre-commit");
    const preCommitContent = `#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
`;
    writeFileSync(preCommitHook, preCommitContent);
    try {
      execSync(`chmod +x "${preCommitHook}"`, { shell: "/bin/bash" });
    } catch (e) {
      // chmod might fail on Windows, that's ok
    }
    console.log("✅ Created .husky/pre-commit");

    // Create pre-push hook
    const prePushHook = join(huskyDir, "pre-push");
    const prePushContent = `#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run type-check
`;
    writeFileSync(prePushHook, prePushContent);
    try {
      execSync(`chmod +x "${prePushHook}"`, { shell: "/bin/bash" });
    } catch (e) {
      // chmod might fail on Windows, that's ok
    }
    console.log("✅ Created .husky/pre-push");

    console.log("\n✅ Husky setup complete");
    return true;
  } catch (error) {
    console.error(`⚠️  Error setting up Husky:`, error.message);
    console.log("You can set it up manually later with:");
    console.log("  npx husky install\n");
    return false;
  }
}

async function fullSetup() {
  console.log("\n🚀 Running complete setup...\n");

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

  console.log("\n✨ Setup complete!\n");
  console.log("You can now run:");
  console.log("  npm run validate     - Run all checks");
  console.log("  npm run lint:fix     - Auto-fix linting issues");
  console.log("  npm run type-check   - Check types\n");
}

(async () => {
  if (command === "setup" || !command) {
    await fullSetup();
  } else if (command === "init") {
    createConfigFiles();
    console.log('\n✨ Run "npx shared-config setup" to complete setup\n');
  } else if (command === "update-package-json" || command === "update") {
    const updated = updatePackageJson();
    console.log("\n✅ Done!\n");
    if (updated) {
      console.log("Next steps:");
      console.log("  npm run validate\n");
    }
  } else if (command === "--help" || command === "-h") {
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
    console.log("Run: npx shared-config --help\n");
    process.exit(1);
  }
})();

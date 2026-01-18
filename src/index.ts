#!/usr/bin/env node

import { Command } from 'commander';
import { detectProject } from './detect.js';
import { generateFiles } from './generate.js';
import { setupHusky } from './husky.js';
import { generateCI } from './ci.js';
import { generateDocker } from './docker.js';
import { addDependencies } from './dependencies.js';
import { printBanner } from './banner.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import type { Options, ProjectInfo } from './types.js';

const execAsync = promisify(exec);

const program = new Command();

program
  .name('stackinit')
  .description('Initialize a consistent development environment for Node-based projects')
  .version('0.1.0')
  .option('--strict', 'Enable stricter lint rules and CI failure on warnings')
  .option('--docker', 'Generate Dockerfile and docker-compose.yml')
  .option('--ci-only', 'Generate only GitHub Actions')
  .option('--dry-run', 'Show what files would be created without writing')
  .action(async (options: Options) => {
    try {
      if (!options.dryRun && !options.ciOnly) {
        printBanner();
      }
      
      const projectInfo = await detectProject();
      
      if (options.dryRun) {
        console.log('\nDRY RUN MODE - No files will be written\n');
        console.log('Detected project:');
        console.log(`  Type: ${projectInfo.type}`);
        console.log(`  Package Manager: ${projectInfo.packageManager}`);
        console.log(`  TypeScript: ${projectInfo.hasTypeScript ? 'Yes' : 'No'}`);
        console.log(`  Monorepo: ${projectInfo.isMonorepo ? 'Yes' : 'No'}\n`);
        console.log('Files that would be generated:');
        console.log('  - .eslintrc.json');
        console.log('  - .prettierrc.json');
        console.log('  - .prettierignore');
        console.log('  - .gitignore');
        console.log('  - .editorconfig');
        console.log('  - .env.example');
        console.log('  - .husky/pre-commit');
        if (options.strict) {
          console.log('  - .husky/commit-msg');
        }
        console.log('  - .github/workflows/ci.yml');
        if (options.docker) {
          console.log('  - Dockerfile');
          console.log('  - docker-compose.yml');
        }
        console.log('\nPackage.json scripts that would be added:');
        console.log('  - lint');
        console.log('  - lint:fix');
        console.log('  - format');
        console.log('  - format:check');
        if (projectInfo.hasTypeScript) {
          console.log('  - type-check');
        }
        console.log('  - prepare (for Husky)');
        console.log('\nDependencies that would be installed:');
        console.log('  - eslint, prettier, husky, lint-staged');
        if (projectInfo.hasTypeScript) {
          console.log('  - @typescript-eslint/parser, @typescript-eslint/eslint-plugin');
        }
        if (projectInfo.type === 'react' || projectInfo.type === 'nextjs' || projectInfo.type === 'vite') {
          console.log('  - eslint-plugin-react, eslint-plugin-react-hooks');
        }
        if (projectInfo.type === 'nextjs') {
          console.log('  - eslint-config-next');
        }
        if (options.strict) {
          console.log('  - @commitlint/cli, @commitlint/config-conventional');
        }
        return;
      }

      if (options.ciOnly) {
        await generateCI(projectInfo, options);
        console.log('\n✓ GitHub Actions CI generated successfully');
        return;
      }

      console.log('\nInitializing development environment...\n');

      // Generate core config files
      await generateFiles(projectInfo, options);

      // Add and install dependencies
      await addDependencies(projectInfo, options);

      // Setup Husky and lint-staged
      await setupHusky(projectInfo, options);

      // Initialize Husky (if git repo exists)
      await initializeHusky(projectInfo);

      // Generate CI
      await generateCI(projectInfo, options);

      // Generate Docker files if requested
      if (options.docker) {
        await generateDocker(projectInfo);
      }

      console.log('\n✓ Development environment initialized successfully\n');
      console.log('Next steps:');
      console.log('  1. Review the generated configuration files');
      console.log('  2. Start developing!\n');
    } catch (error) {
      console.error('\nERROR:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

async function initializeHusky(projectInfo: ProjectInfo): Promise<void> {
  try {
    const { access } = await import('fs/promises');
    await access(projectInfo.rootPath + '/.git');
    
    // Husky install
    const huskyCommand = projectInfo.packageManager === 'pnpm'
      ? 'pnpm exec husky install'
      : 'npx husky install';
    
    try {
      await execAsync(huskyCommand, { cwd: projectInfo.rootPath });
      console.log('✓ Husky initialized');
    } catch {
      // Husky install might fail if not in git repo or already installed
      // This is okay, user can run manually if needed
    }
  } catch {
    // Not a git repo, skip husky init
  }
}

program.parse();


import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import type { ProjectInfo, Options } from './types.js';

const execAsync = promisify(exec);

export async function addDependencies(projectInfo: ProjectInfo, options: Options): Promise<void> {
  const packageJsonPath = join(projectInfo.rootPath, 'package.json');
  
  try {
    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));
    
    // Initialize devDependencies if not present
    if (!packageJson.devDependencies) {
      packageJson.devDependencies = {};
    }

    // Core dependencies (always needed)
    const coreDeps: Record<string, string> = {
      eslint: '^8.57.0',
      prettier: '^3.2.0',
      husky: '^9.0.0',
      'lint-staged': '^15.2.0',
    };

    // TypeScript dependencies
    if (projectInfo.hasTypeScript) {
      coreDeps['@typescript-eslint/parser'] = '^6.19.0';
      coreDeps['@typescript-eslint/eslint-plugin'] = '^6.19.0';
    }

    // React dependencies
    const isReact = projectInfo.type === 'react' || 
                   projectInfo.type === 'nextjs' || 
                   projectInfo.type === 'vite';
    
    if (isReact) {
      coreDeps['eslint-plugin-react'] = '^7.33.0';
      coreDeps['eslint-plugin-react-hooks'] = '^4.6.0';
    }

    // Next.js specific
    if (projectInfo.type === 'nextjs') {
      coreDeps['eslint-config-next'] = 'latest';
    }

    // Commitlint (strict mode)
    if (options.strict) {
      coreDeps['@commitlint/cli'] = '^18.6.0';
      coreDeps['@commitlint/config-conventional'] = '^18.6.0';
    }

    // Add dependencies only if they don't already exist
    let hasNewDeps = false;
    for (const [dep, version] of Object.entries(coreDeps)) {
      if (!packageJson.devDependencies[dep] && !packageJson.dependencies?.[dep]) {
        packageJson.devDependencies[dep] = version;
        hasNewDeps = true;
      }
    }

    if (hasNewDeps) {
      await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf-8');
      console.log('  Updated package.json with dependencies');
      
      // Install dependencies
      await installDependencies(projectInfo);
    } else {
      console.log('  All required dependencies already present');
    }
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      console.warn('  Warning: package.json not found, skipping dependency installation');
    } else {
      throw error;
    }
  }
}

async function installDependencies(projectInfo: ProjectInfo): Promise<void> {
  const { packageManager } = projectInfo;
  const rootPath = projectInfo.rootPath;

  console.log(`\n  Installing dependencies with ${packageManager}...`);

  try {
    let installCommand: string;
    
    switch (packageManager) {
      case 'pnpm':
        installCommand = 'pnpm install';
        break;
      case 'yarn':
        installCommand = 'yarn install';
        break;
      case 'npm':
      default:
        installCommand = 'npm install';
        break;
    }

    await execAsync(installCommand, {
      cwd: rootPath,
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
    });

    console.log('  Dependencies installed successfully');
  } catch {
    console.error('  Failed to install dependencies automatically');
    console.error('  Please run manually:', 
      packageManager === 'pnpm' ? 'pnpm install' :
      packageManager === 'yarn' ? 'yarn install' :
      'npm install'
    );
    // Don't throw - let the user install manually if needed
  }
}


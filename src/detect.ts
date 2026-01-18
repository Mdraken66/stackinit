import { readFile, access } from 'fs/promises';
import { join } from 'path';
import type { ProjectInfo, ProjectType, PackageManager } from './types.js';

export async function detectProject(): Promise<ProjectInfo> {
  const rootPath = process.cwd();
  
  const [type, packageManager, hasTypeScript, isMonorepo] = await Promise.all([
    detectProjectType(rootPath),
    detectPackageManager(rootPath),
    detectTypeScript(rootPath),
    detectMonorepo(rootPath),
  ]);

  return {
    type,
    packageManager,
    hasTypeScript,
    isMonorepo,
    rootPath,
  };
}

async function detectProjectType(rootPath: string): Promise<ProjectType> {
  try {
    const packageJsonPath = join(rootPath, 'package.json');
    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

    // Check for Next.js
    if (deps.next || deps['nextjs']) {
      return 'nextjs';
    }

    // Check for Vite
    if (deps.vite || deps['@vitejs/plugin-react']) {
      return 'vite';
    }

    // Check for React
    if (deps.react || deps['react-dom']) {
      return 'react';
    }

    // Default to Node backend
    return 'node';
  } catch {
    return 'unknown';
  }
}

async function detectPackageManager(rootPath: string): Promise<PackageManager> {
  // Check for lock files
  const lockFiles = [
    { file: 'pnpm-lock.yaml', manager: 'pnpm' as PackageManager },
    { file: 'yarn.lock', manager: 'yarn' as PackageManager },
    { file: 'package-lock.json', manager: 'npm' as PackageManager },
  ];

  for (const { file, manager } of lockFiles) {
    try {
      await access(join(rootPath, file));
      return manager;
    } catch {
      // Continue checking
    }
  }

  // Check for packageManager field in package.json
  try {
    const packageJsonPath = join(rootPath, 'package.json');
    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));
    if (packageJson.packageManager) {
      if (packageJson.packageManager.startsWith('pnpm')) return 'pnpm';
      if (packageJson.packageManager.startsWith('yarn')) return 'yarn';
      if (packageJson.packageManager.startsWith('npm')) return 'npm';
    }
  } catch {
    // Fall through
  }

  // Default to npm
  return 'npm';
}

async function detectTypeScript(rootPath: string): Promise<boolean> {
  try {
    const tsConfigPath = join(rootPath, 'tsconfig.json');
    await access(tsConfigPath);
    return true;
  } catch {
    // Check for TypeScript in dependencies
    try {
      const packageJsonPath = join(rootPath, 'package.json');
      const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      return 'typescript' in deps;
    } catch {
      return false;
    }
  }
}

async function detectMonorepo(rootPath: string): Promise<boolean> {
  // Check for common monorepo indicators
  const indicators = [
    'pnpm-workspace.yaml',
    'lerna.json',
    'nx.json',
    'turbo.json',
    'rush.json',
  ];

  for (const indicator of indicators) {
    try {
      await access(join(rootPath, indicator));
      return true;
    } catch {
      // Continue checking
    }
  }

  // Check package.json for workspaces
  try {
    const packageJsonPath = join(rootPath, 'package.json');
    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));
    return !!(packageJson.workspaces || packageJson.workspace);
  } catch {
    return false;
  }
}


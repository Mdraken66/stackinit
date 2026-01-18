import { writeFile, mkdir, access, readFile } from 'fs/promises';
import { join } from 'path';
import type { ProjectInfo, Options } from './types.js';

export async function setupHusky(projectInfo: ProjectInfo, options: Options): Promise<void> {
  const huskyDir = join(projectInfo.rootPath, '.husky');
  
  // Check if .git exists
  try {
    await access(join(projectInfo.rootPath, '.git'));
  } catch {
    console.warn('  Warning: .git directory not found, skipping Husky setup');
    return;
  }

  // Create .husky directory
  try {
    await mkdir(huskyDir, { recursive: true });
  } catch {
    // Directory might already exist
  }

  // Create pre-commit hook
  const preCommitHook = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

${projectInfo.packageManager === 'pnpm' ? 'pnpm' : 'npx'} lint-staged
`;

  const preCommitPath = join(huskyDir, 'pre-commit');
  await writeFile(preCommitPath, preCommitHook, 'utf-8');
  
  // Make it executable (Unix-like systems)
  if (process.platform !== 'win32') {
    const { chmod } = await import('fs/promises');
    await chmod(preCommitPath, 0o755);
  }

  // Create commit-msg hook if commitlint is enabled
  if (options.strict) {
    const commitMsgHook = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

${projectInfo.packageManager === 'pnpm' ? 'pnpm' : 'npx'} commitlint --edit "$1"
`;

    const commitMsgPath = join(huskyDir, 'commit-msg');
    await writeFile(commitMsgPath, commitMsgHook, 'utf-8');
    
    if (process.platform !== 'win32') {
      const { chmod } = await import('fs/promises');
      await chmod(commitMsgPath, 0o755);
    }
  }

  // Update package.json with husky and lint-staged config
  await updatePackageJsonForHusky(projectInfo, options);
}

async function updatePackageJsonForHusky(projectInfo: ProjectInfo, options: Options): Promise<void> {
  const packageJsonPath = join(projectInfo.rootPath, 'package.json');
  
  try {
    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));
    
    // Add prepare script for husky
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }
    
    if (!packageJson.scripts.prepare) {
      packageJson.scripts.prepare = 'husky install';
    }

    // Add lint-staged configuration
    if (!packageJson['lint-staged']) {
      const lintStagedConfig: Record<string, string | string[]> = {
        '*.{js,jsx,ts,tsx}': [
          'eslint --fix',
          'prettier --write',
        ],
        '*.{json,md,yml,yaml}': [
          'prettier --write',
        ],
      };

      packageJson['lint-staged'] = lintStagedConfig;
    }

    // Add commitlint config if strict mode
    if (options.strict && !packageJson.commitlint) {
      packageJson.commitlint = {
        extends: ['@commitlint/config-conventional'],
      };
    }

    await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf-8');
    console.log('  Configured Husky git hooks');
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      console.warn('  Warning: package.json not found, skipping Husky configuration');
    } else {
      throw error;
    }
  }
}


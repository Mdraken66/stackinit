import { mkdir, writeFile, access } from 'fs/promises';
import { join } from 'path';
import type { ProjectInfo, Options } from './types.js';

export async function generateCI(projectInfo: ProjectInfo, options: Options): Promise<void> {
  const workflowsDir = join(projectInfo.rootPath, '.github', 'workflows');
  
  try {
    await mkdir(workflowsDir, { recursive: true });
  } catch {
    // Directory might already exist
  }

  const ciYml = generateCIYml(projectInfo, options);
  const ciPath = join(workflowsDir, 'ci.yml');
  
  // Check if file already exists
  try {
    await access(ciPath);
    console.log('  Skipping .github/workflows/ci.yml (already exists)');
    return;
  } catch {
    // File doesn't exist, proceed
  }

  await writeFile(ciPath, ciYml, 'utf-8');
  console.log('  Generated .github/workflows/ci.yml');
}

function generateCIYml(projectInfo: ProjectInfo, options: Options): string {
  const nodeVersion = '20';
  const installCommand = getInstallCommand(projectInfo.packageManager);

  // Build YAML content
  let yaml = `name: CI

on:
  push:
    branches: [main, master, develop]
  pull_request:
    branches: [main, master, develop]

jobs:
  ci:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '${nodeVersion}'
          cache: '${projectInfo.packageManager}'
      
      - name: Install dependencies
        run: ${installCommand}
      
      - name: Lint
        run: ${projectInfo.packageManager === 'pnpm' ? 'pnpm lint' : 'npm run lint'}
${options.strict ? '' : '        continue-on-error: true'}
      
`;

  if (projectInfo.hasTypeScript) {
    yaml += `      - name: Type check
        run: ${projectInfo.packageManager === 'pnpm' ? 'pnpm type-check' : 'npm run type-check'}
${options.strict ? '' : '        continue-on-error: true'}
      
`;
  }

  yaml += `      - name: Run tests
        run: ${projectInfo.packageManager === 'pnpm' ? 'pnpm test' : 'npm test'}
        continue-on-error: true
`;

  return yaml;
}

function getInstallCommand(packageManager: ProjectInfo['packageManager']): string {
  switch (packageManager) {
    case 'pnpm':
      return 'pnpm install --frozen-lockfile';
    case 'yarn':
      return 'yarn install --frozen-lockfile';
    case 'npm':
    default:
      return 'npm ci';
  }
}



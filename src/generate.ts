import { writeFile, readFile, access } from 'fs/promises';
import { join } from 'path';
import type { ProjectInfo, Options } from './types.js';
import { getTemplates } from './templates.js';

export async function generateFiles(projectInfo: ProjectInfo, options: Options): Promise<void> {
  const templates = getTemplates(projectInfo, options);
  const filesToGenerate = [
    { name: '.eslintrc.json', content: templates.eslint },
    { name: '.prettierrc.json', content: templates.prettier },
    { name: '.prettierignore', content: templates.prettierIgnore },
    { name: '.gitignore', content: templates.gitignore },
    { name: '.editorconfig', content: templates.editorconfig },
    { name: '.env.example', content: templates.envExample },
  ];

  for (const file of filesToGenerate) {
    const filePath = join(projectInfo.rootPath, file.name);
    
    // Skip if file exists (don't overwrite)
    try {
      await access(filePath);
      console.log(`  Skipping ${file.name} (already exists)`);
      continue;
    } catch {
      // File doesn't exist, proceed
    }

    await writeFile(filePath, file.content, 'utf-8');
    console.log(`  Generated ${file.name}`);
  }

  // Update package.json scripts
  await updatePackageJson(projectInfo);
}

async function updatePackageJson(projectInfo: ProjectInfo): Promise<void> {
  const packageJsonPath = join(projectInfo.rootPath, 'package.json');
  
  try {
    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));
    
    // Initialize scripts if not present
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }

    // Add scripts only if they don't exist
    const scriptsToAdd: Record<string, string> = {
      lint: projectInfo.hasTypeScript 
        ? 'eslint . --ext .js,.jsx,.ts,.tsx'
        : 'eslint . --ext .js,.jsx',
      'lint:fix': projectInfo.hasTypeScript
        ? 'eslint . --ext .js,.jsx,.ts,.tsx --fix'
        : 'eslint . --ext .js,.jsx --fix',
      format: 'prettier --write "**/*.{js,jsx,ts,tsx,json,md}"',
      'format:check': 'prettier --check "**/*.{js,jsx,ts,tsx,json,md}"',
    };

    if (projectInfo.hasTypeScript) {
      scriptsToAdd['type-check'] = 'tsc --noEmit';
    }

    // Only add scripts that don't already exist
    for (const [key, value] of Object.entries(scriptsToAdd)) {
      if (!packageJson.scripts[key]) {
        packageJson.scripts[key] = value;
      }
    }

    await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf-8');
    console.log('  Updated package.json scripts');
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      console.warn('  Warning: package.json not found, skipping script updates');
    } else {
      throw error;
    }
  }
}


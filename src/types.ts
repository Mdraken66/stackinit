export type ProjectType = 'node' | 'react' | 'nextjs' | 'vite' | 'unknown';
export type PackageManager = 'npm' | 'yarn' | 'pnpm';

export interface ProjectInfo {
  type: ProjectType;
  packageManager: PackageManager;
  hasTypeScript: boolean;
  isMonorepo: boolean;
  rootPath: string;
}

export interface Options {
  strict?: boolean;
  docker?: boolean;
  ciOnly?: boolean;
  dryRun?: boolean;
}


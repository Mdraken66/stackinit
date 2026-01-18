import type { ProjectInfo, Options } from './types.js';

export interface Templates {
  eslint: string;
  prettier: string;
  prettierIgnore: string;
  gitignore: string;
  editorconfig: string;
  envExample: string;
}

export function getTemplates(projectInfo: ProjectInfo, options: Options): Templates {
  return {
    eslint: getESLintConfig(projectInfo, options),
    prettier: getPrettierConfig(),
    prettierIgnore: getPrettierIgnore(),
    gitignore: getGitignore(projectInfo),
    editorconfig: getEditorConfig(),
    envExample: getEnvExample(projectInfo),
  };
}

function getESLintConfig(projectInfo: ProjectInfo, options: Options): string {
  const isStrict = options.strict ?? false;
  const hasTypeScript = projectInfo.hasTypeScript;
  const isReact = projectInfo.type === 'react' || projectInfo.type === 'nextjs' || projectInfo.type === 'vite';

  const config: any = {
    root: true,
    env: {
      node: true,
      es2022: true,
      ...(isReact && { browser: true }),
    },
    extends: [],
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    rules: {
      'no-console': isStrict ? 'error' : 'warn',
      'no-debugger': isStrict ? 'error' : 'warn',
      'no-unused-vars': isStrict ? 'error' : 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
    },
  };

  if (hasTypeScript) {
    config.parser = '@typescript-eslint/parser';
    config.plugins = ['@typescript-eslint'];
    config.extends.push(
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      ...(isStrict ? ['plugin:@typescript-eslint/recommended-requiring-type-checking'] : [])
    );
    config.parserOptions = {
      ...config.parserOptions,
      project: './tsconfig.json',
    };
    config.rules = {
      ...config.rules,
      '@typescript-eslint/no-unused-vars': isStrict ? 'error' : 'warn',
      '@typescript-eslint/explicit-function-return-type': isStrict ? 'warn' : 'off',
      '@typescript-eslint/no-explicit-any': isStrict ? 'error' : 'warn',
    };
  } else {
    config.extends.push('eslint:recommended');
  }

  if (isReact) {
    config.extends.push('plugin:react/recommended', 'plugin:react-hooks/recommended');
    config.settings = {
      react: {
        version: 'detect',
      },
    };
    config.rules = {
      ...config.rules,
      'react/react-in-jsx-scope': 'off', // Not needed in React 17+
      'react/prop-types': 'off', // TypeScript handles this
    };
  }

  if (projectInfo.type === 'nextjs') {
    config.extends.push('plugin:@next/next/recommended');
  }

  return JSON.stringify(config, null, 2);
}

function getPrettierConfig(): string {
  return JSON.stringify(
    {
      semi: true,
      trailingComma: 'es5',
      singleQuote: true,
      printWidth: 80,
      tabWidth: 2,
      useTabs: false,
      arrowParens: 'always',
      endOfLine: 'lf',
    },
    null,
    2
  );
}

function getPrettierIgnore(): string {
  return `node_modules
dist
build
.next
.nuxt
.cache
coverage
*.log
.DS_Store
.env
.env.local
`;
}

function getGitignore(projectInfo: ProjectInfo): string {
  const base = `# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/
*.lcov
.nyc_output

# Production
dist/
build/
.next/
out/
.nuxt/
.cache/

# Misc
.DS_Store
*.pem
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Local env files
.env
.env*.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
Thumbs.db
`;

  if (projectInfo.type === 'nextjs') {
    return base + `
# Next.js
.next/
out/
`;
  }

  if (projectInfo.type === 'vite') {
    return base + `
# Vite
dist/
dist-ssr/
*.local
`;
  }

  return base;
}

function getEditorConfig(): string {
  return `root = true

[*]
charset = utf-8
end_of_line = lf
indent_style = space
indent_size = 2
insert_final_newline = true
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false

[*.{yml,yaml}]
indent_size = 2

[Makefile]
indent_style = tab
`;
}

function getEnvExample(projectInfo: ProjectInfo): string {
  const base = `# Environment variables
# Copy this file to .env and fill in the values

NODE_ENV=development
PORT=3000
`;

  if (projectInfo.type === 'nextjs') {
    return base + `
# Next.js
NEXT_PUBLIC_API_URL=http://localhost:3000/api
`;
  }

  if (projectInfo.type === 'react' || projectInfo.type === 'vite') {
    return base + `
# API
VITE_API_URL=http://localhost:3000/api
REACT_APP_API_URL=http://localhost:3000/api
`;
  }

  return base + `
# Database (example)
# DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# API Keys (example)
# API_KEY=your-api-key-here
`;
}


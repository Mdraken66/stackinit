# stackinit

> Initialize a consistent development environment for Node-based projects with a single command.

[![npm version](https://img.shields.io/npm/v/stackinit.svg)](https://www.npmjs.com/package/stackinit)
[![npm downloads](https://img.shields.io/npm/dm/stackinit.svg)](https://www.npmjs.com/package/stackinit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/nupurkale78/stackinit.svg)](https://github.com/nupurkale78/stackinit)
[![GitHub issues](https://img.shields.io/github/issues/nupurkale78/stackinit.svg)](https://github.com/nupurkale78/stackinit/issues)

## Philosophy

`stackinit` is an opinionated CLI tool that sets up a production-ready development environment for Node.js projects. It follows these principles:

- **Zero configuration by default**: Sensible defaults that work for most projects
- **Non-destructive**: Never overwrites existing files
- **TypeScript-first**: Optimized for TypeScript projects but works with JavaScript
- **No interactive prompts**: Everything is configurable via flags
- **Production-ready**: Includes CI/CD, linting, formatting, and git hooks out of the box

## Installation

```bash
npx stackinit
```

Or install globally:

```bash
npm install -g stackinit
```

## Usage

### Basic Usage

Run `stackinit` in your project directory:

```bash
npx stackinit
```

This will:
- Auto-detect your project type (Node, React, Next.js, Vite)
- Detect your package manager (npm, yarn, pnpm)
- Generate configuration files (ESLint, Prettier, .gitignore, etc.)
- Set up Husky git hooks with lint-staged
- Create GitHub Actions CI workflow

### Options

```bash
npx stackinit [options]

Options:
  --strict        Enable stricter lint rules and CI failure on warnings
  --docker        Generate Dockerfile and docker-compose.yml
  --ci-only       Generate only GitHub Actions workflow
  --dry-run       Show what files would be created without writing
  -h, --help      Display help for command
  -V, --version   Display version number
```

### Examples

**Strict mode with Docker:**
```bash
npx stackinit --strict --docker
```

**CI-only (for existing projects):**
```bash
npx stackinit --ci-only
```

**Dry run to preview changes:**
```bash
npx stackinit --dry-run
```

## What Gets Generated

### Configuration Files

- **`.eslintrc.json`** - ESLint configuration (TypeScript-aware, React-aware)
- **`.prettierrc.json`** - Prettier configuration
- **`.prettierignore`** - Prettier ignore patterns
- **`.gitignore`** - Comprehensive .gitignore for Node.js projects
- **`.editorconfig`** - EditorConfig for consistent coding styles
- **`.env.example`** - Environment variables template

### Git Hooks (Husky)

- **pre-commit** - Runs lint-staged to lint and format staged files
- **commit-msg** - Runs commitlint (only in strict mode)

### CI/CD

- **`.github/workflows/ci.yml`** - GitHub Actions workflow that:
  - Installs dependencies
  - Runs linting
  - Runs type checking (if TypeScript)
  - Runs tests (if present)

### Docker (optional)

- **`Dockerfile`** - Multi-stage Docker build
- **`docker-compose.yml`** - Docker Compose configuration

### Package.json Scripts

The following scripts are added to your `package.json` (only if they don't already exist):

- `lint` - Run ESLint
- `lint:fix` - Run ESLint with auto-fix
- `format` - Format code with Prettier
- `format:check` - Check code formatting
- `type-check` - TypeScript type checking (if TypeScript is detected)
- `prepare` - Husky install hook

## Project Detection

`stackinit` automatically detects:

- **Project Type**: Node backend, React, Next.js, Vite
- **Package Manager**: npm, yarn, pnpm (via lock files or package.json)
- **TypeScript**: Checks for `tsconfig.json` or TypeScript in dependencies
- **Monorepo**: Detects pnpm workspaces, Lerna, Nx, Turborepo, Rush

## Features

### Auto-Detection

The tool intelligently detects your project setup and generates appropriate configurations:

- **React projects**: Adds React ESLint plugins
- **Next.js projects**: Adds Next.js ESLint config
- **TypeScript projects**: Configures TypeScript ESLint parser
- **Monorepos**: Adapts configurations for monorepo structures

### Non-Destructive

`stackinit` never overwrites existing files. If a file already exists, it will be skipped with a warning.

### Strict Mode

When using `--strict`:

- Stricter ESLint rules
- CI fails on warnings (not just errors)
- Commitlint enabled for conventional commits
- More aggressive TypeScript checks

## Requirements

- Node.js >= 18.0.0
- Git repository (for Husky setup)

## After Running

`stackinit` automatically:

- ✅ Installs all required dependencies (ESLint, Prettier, Husky, lint-staged, etc.)
- ✅ Detects and installs TypeScript ESLint plugins if TypeScript is detected
- ✅ Detects and installs React plugins if React is detected
- ✅ Installs commitlint if `--strict` mode is enabled
- ✅ Initializes Husky git hooks (if in a git repository)

**That's it!** You're ready to start developing. The tool handles everything automatically based on your project setup.

## Development

### Testing Locally

To test `stackinit` locally during development:

```bash
# Install dependencies
npm install

# Development mode (runs TypeScript directly)
npm run dev

# Or build and test
npm run build
npm start

# Test with options (note: use -- to pass flags to the script)
npm run dev -- --dry-run
npm run dev -- --strict
npm run dev -- --docker
npm run dev -- --strict --docker
```

**Important:** When using npm scripts, use `--` to pass flags to the underlying command. For example: `npm run dev -- --docker`

For detailed development and testing instructions, see [CONTRIBUTING.md](CONTRIBUTING.md).

## Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

MIT


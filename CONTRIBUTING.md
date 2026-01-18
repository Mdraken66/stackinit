# Contributing to stackinit

Thank you for your interest in contributing to stackinit! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## How to Contribute

### Reporting Bugs

Before reporting a bug, please:

1. Check if the issue has already been reported in the [Issues](https://github.com/yourusername/stackinit/issues) section
2. Verify that the bug still exists in the latest version
3. Collect relevant information:
   - Node.js version
   - Operating system
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Error messages (if any)

When creating a bug report, please use the bug report template and include as much detail as possible.

### Suggesting Features

We welcome feature suggestions! Please:

1. Check if the feature has already been suggested
2. Open an issue with the "enhancement" label
3. Clearly describe:
   - The problem the feature would solve
   - How the feature would work
   - Why it would be useful

### Pull Requests

We love pull requests! Here's how to submit one:

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/stackinit.git
   cd stackinit
   ```

2. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

3. **Set up the development environment**
   ```bash
   npm install
   ```

4. **Make your changes**
   - Write clean, maintainable code
   - Follow the existing code style
   - Add tests if applicable
   - Update documentation as needed

5. **Test your changes**
   ```bash
   # Development mode (no build needed)
   npm run dev
   
   # Or build and test
   npm run build
   npm start
   
   # Test with options
   npm run dev -- --dry-run
   npm run dev -- --strict --docker
   ```
   
   **Test in a real project:**
   ```bash
   # Create test project
   mkdir test-project && cd test-project
   npm init -y
   
   # Use npm link (from stackinit directory)
   npm link
   
   # Now test from test-project
   stackinit --dry-run
   ```

6. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```
   
   We follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation changes
   - `style:` for code style changes (formatting, etc.)
   - `refactor:` for code refactoring
   - `test:` for adding or updating tests
   - `chore:` for maintenance tasks

7. **Push and create a Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

8. **Open a Pull Request**
   - Provide a clear description of your changes
   - Reference any related issues
   - Wait for review and address feedback

## Development Setup

### Prerequisites

- Node.js >= 18.0.0
- npm, yarn, or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/stackinit.git
cd stackinit

# Install dependencies
npm install

# Build the project
npm run build
```

### Development Workflow

```bash
# Run in development mode (with tsx)
npm run dev

# Build TypeScript
npm run build

# Run the built CLI
npm start
```

### Testing Your Changes

To test your changes locally:

1. Build the project:
   ```bash
   npm run build
   ```

2. Create a test project directory:
   ```bash
   mkdir test-project
   cd test-project
   npm init -y
   ```

3. Run stackinit from the built dist:
   ```bash
   node ../stackinit/dist/index.js
   ```

   Or use `npm link` for easier testing:
   ```bash
   # From stackinit directory
   npm link
   
   # From test project directory
   npx stackinit
   ```

## Code Style Guidelines

### TypeScript

- Use TypeScript strict mode
- Prefer explicit types over `any`
- Use meaningful variable and function names
- Keep functions focused and small
- Add JSDoc comments for public APIs

### Code Organization

- Keep modules focused on a single responsibility
- Use descriptive file and directory names
- Group related functionality together
- Export only what's necessary

### Formatting

The project uses Prettier for code formatting. Before committing:

```bash
npm run format
```

### Linting

We use ESLint for code quality. Check for linting errors:

```bash
npm run lint
```

Fix auto-fixable issues:

```bash
npm run lint:fix
```

## Project Structure

```
stackinit/
├── src/
│   ├── index.ts          # CLI entry point
│   ├── detect.ts         # Project detection logic
│   ├── generate.ts       # File generation
│   ├── templates.ts      # Template content
│   ├── husky.ts          # Husky setup
│   ├── ci.ts             # CI generation
│   ├── docker.ts         # Docker generation
│   └── types.ts          # Type definitions
├── dist/                 # Compiled output (gitignored)
└── ...
```

## Areas for Contribution

We welcome contributions in these areas:

- **Bug fixes**: Fix issues reported in the issue tracker
- **New features**: Add support for new project types or tools
- **Documentation**: Improve README, add examples, write guides
- **Testing**: Add tests to improve code coverage
- **Performance**: Optimize detection or generation logic
- **DX improvements**: Better error messages, more helpful output

## Review Process

1. All pull requests require at least one review
2. Maintainers will review your PR and may request changes
3. Once approved, a maintainer will merge your PR
4. Be patient and responsive to feedback

## Questions?

If you have questions about contributing:

- Open an issue with the "question" label
- Check existing issues and discussions
- Review the README for project overview

## Recognition

Contributors will be recognized in:
- The project's README (if applicable)
- Release notes for significant contributions
- GitHub contributors page

Thank you for contributing to stackinit! 🎉


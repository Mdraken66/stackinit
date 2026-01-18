import { writeFile, access } from 'fs/promises';
import { join } from 'path';
import type { ProjectInfo } from './types.js';

export async function generateDocker(projectInfo: ProjectInfo): Promise<void> {
  const dockerfile = generateDockerfile(projectInfo);
  const dockerCompose = generateDockerCompose();

  const dockerfilePath = join(projectInfo.rootPath, 'Dockerfile');
  const dockerComposePath = join(projectInfo.rootPath, 'docker-compose.yml');

  // Check if files exist
  try {
    await access(dockerfilePath);
    console.log('  Skipping Dockerfile (already exists)');
  } catch {
    await writeFile(dockerfilePath, dockerfile, 'utf-8');
    console.log('  Generated Dockerfile');
  }

  try {
    await access(dockerComposePath);
    console.log('  Skipping docker-compose.yml (already exists)');
  } catch {
    await writeFile(dockerComposePath, dockerCompose, 'utf-8');
    console.log('  Generated docker-compose.yml');
  }
}

function generateDockerfile(projectInfo: ProjectInfo): string {
  const packageManager = projectInfo.packageManager;
  const installCmd = packageManager === 'pnpm' 
    ? 'RUN pnpm install --frozen-lockfile'
    : packageManager === 'yarn'
    ? 'RUN yarn install --frozen-lockfile'
    : 'RUN npm ci';

  const lockFileName = packageManager === 'pnpm'
    ? 'pnpm-lock.yaml'
    : packageManager === 'yarn'
    ? 'yarn.lock'
    : 'package-lock.json';

  return `# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json .
COPY ${lockFileName} .

${installCmd}

# Copy source files
COPY . .

# Build the application (adjust as needed)
${projectInfo.hasTypeScript ? 'RUN npm run build' : '# Add build command if needed'}

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files
COPY package.json .
COPY ${lockFileName} .

# Install production dependencies only
${packageManager === 'pnpm'
  ? 'RUN pnpm install --frozen-lockfile --prod'
  : packageManager === 'yarn'
  ? 'RUN yarn install --frozen-lockfile --production'
  : 'RUN npm ci --only=production'}

# Copy built application from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public 2>/dev/null || true

# Expose port (adjust as needed)
EXPOSE 3000

# Start the application
CMD ["node", "dist/index.js"]
`;
}

function generateDockerCompose(): string {
  return `version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    # volumes:
    #   - ./data:/app/data
`;
}


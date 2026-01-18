# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json COPY package-lock.json .

RUN npm ci

# Copy source files
COPY . .

# Build the application (adjust as needed)
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files
COPY package.json COPY package-lock.json .

# Install production dependencies only
RUN npm ci --only=production

# Copy built application from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public 2>/dev/null || true

# Expose port (adjust as needed)
EXPOSE 3000

# Start the application
CMD ["node", "dist/index.js"]

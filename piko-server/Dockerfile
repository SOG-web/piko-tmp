# Build stage
FROM node:24-alpine AS builder

# Enable corepack and use pnpm
RUN corepack enable

WORKDIR /app

# Copy package files
COPY package*.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Production stage
FROM node:24-alpine AS runner

# Enable corepack and use pnpm
RUN corepack enable

WORKDIR /app

# Copy package files
COPY package*.json pnpm-lock.yaml* ./

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S proxy -u 1001

# Change ownership of the app directory
RUN chown -R proxy:nodejs /app
USER proxy

EXPOSE 3000

CMD ["node", "dist/index.js"] 
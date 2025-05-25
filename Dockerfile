# Build stage for Next.js frontend
FROM --platform=linux/amd64 node:18-alpine AS frontend-builder

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm and dependencies
RUN npm install -g pnpm
RUN pnpm install

# Copy frontend source code
COPY src/ ./src/
COPY next.config.ts tsconfig.json postcss.config.mjs ./
COPY eslint.config.mjs components.json ./

# Build the Next.js app
RUN pnpm build

# Production stage
FROM --platform=linux/amd64 python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy Python backend code
COPY python/ ./python/

# Copy built frontend from builder stage
COPY --from=frontend-builder /app/out ./static

# Create images directory for uploads
RUN mkdir -p /app/images

# Set environment variables
ENV PORT=8080
ENV PYTHONPATH=/app

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Start FastAPI server
CMD ["python", "-m", "uvicorn", "python.main:app", "--host", "0.0.0.0", "--port", "8080"]
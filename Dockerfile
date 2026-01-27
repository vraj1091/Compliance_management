# Multi-stage build for QMS-ERP Application

# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install ALL dependencies (including devDependencies needed for build)
RUN npm ci

# Copy frontend source
COPY frontend/ ./

# Build frontend
RUN npm run build

# Stage 2: Backend with Frontend
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements
COPY backend/requirements.txt ./

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./

# Copy built frontend from previous stage
COPY --from=frontend-builder /app/frontend/dist ./static

# Create uploads directory
RUN mkdir -p uploads

# Make startup script executable
RUN chmod +x /app/start.sh

# Expose port
EXPOSE 8000

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV DATABASE_URL=sqlite+aiosqlite:///./qms_erp.db
ENV PORT=8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Start application
CMD ["/bin/bash", "/app/start.sh"]

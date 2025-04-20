FROM node:20-alpine as builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .
# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Create directory for SQLite database
RUN mkdir -p /data
VOLUME ["/data"]

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Set environment variables
ENV NODE_ENV=production
ENV TYPEORM_CONNECTION=sqlite
ENV TYPEORM_DATABASE=/data/db.sqlite
ENV PORT=8000

# Expose the port the app runs on
EXPOSE 8000

# Start the application
CMD ["node", "dist/main"]
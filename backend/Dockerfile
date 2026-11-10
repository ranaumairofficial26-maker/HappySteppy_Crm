# Use official Node.js 20 LTS Alpine image for lightweight & fast deployment
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy application source code
COPY . .

# Default environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Expose port (Render injects PORT dynamically)
EXPOSE 5000

# Start server
CMD ["node", "server.js"]

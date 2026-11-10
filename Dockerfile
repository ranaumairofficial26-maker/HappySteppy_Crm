# Render Root Dockerfile for Happy Steppy Backend
FROM node:20-alpine

WORKDIR /app

# Copy backend dependencies
COPY backend/package*.json ./

RUN npm install --omit=dev

# Copy backend source
COPY backend/ ./

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["node", "server.js"]

# ----- Stage 1: Build Stage -----
FROM --platform=$BUILDPLATFORM node:16.8.0-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ----- Stage 2: Production Stage -----
FROM node:16.8.0-alpine AS production

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app .

EXPOSE 3000
USER node
CMD ["node", "server.js"]

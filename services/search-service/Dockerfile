# --- Build Stage ---
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# --- Production Stage ---
FROM node:20-alpine

WORKDIR /app

# Copy only necessary files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

# Install production dependencies only
RUN npm install --only=production

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "dist/main.js"]

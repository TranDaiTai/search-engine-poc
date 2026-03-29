FROM node:18-slim

WORKDIR /app

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

# Generate Prisma Client
RUN npx prisma generate

RUN npm run build

EXPOSE 3001

CMD ["npm", "run", "dev"]

FROM node:18-slim
WORKDIR /app
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
COPY .env ./
RUN npm install

COPY . .
RUN DATABASE_URL=postgresql://user:password@postgres:5432/orders_db npx prisma generate
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]

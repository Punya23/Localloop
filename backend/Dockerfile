FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy prisma config & schema first (needed for generate)
COPY prisma.config.ts ./
COPY prisma/ ./prisma/

# Copy source code
COPY . .

# Build (prisma generate + nest build)
RUN npm run build

ENV NODE_ENV=production

EXPOSE 3001

CMD ["node", "dist/main.js"]

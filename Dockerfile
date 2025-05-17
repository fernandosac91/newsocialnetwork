FROM node:18-alpine

# Install dependencies needed for Prisma and bcrypt
RUN apk add --no-cache libc6-compat openssl python3 make g++ git

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy the rest of the application
COPY . .

# Build the Next.js application
RUN npm run build

EXPOSE 3000

# Start the application using the simplified server for Docker
CMD ["node", "docker-server.js"] 
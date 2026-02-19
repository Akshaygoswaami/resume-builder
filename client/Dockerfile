FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy frontend and shared code
COPY client/ ./client/
COPY shared/ ./shared/
COPY vite.config.ts tsconfig.json ./

# Expose Vite's default port
EXPOSE 5000

CMD ["npm", "run", "dev"]

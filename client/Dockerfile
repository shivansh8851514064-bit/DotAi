# client/Dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

# Vite's default port
EXPOSE 5173 

# Start Vite and expose it to the Docker network
CMD ["npm", "run", "dev", "--", "--host"]
# Use lightweight Node.js alpine image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy app source files
COPY . .

# Expose the API port
EXPOSE 3001

# Start the server
CMD ["node", "server.js"]

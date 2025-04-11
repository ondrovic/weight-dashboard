FROM node:20-alpine

WORKDIR /app

# Accept build arguments from docker-compose
ARG NODE_ENV
ARG PORT
ARG MONGODB_URI
ARG CORS_ORIGIN

# Set environment variables
ENV NODE_ENV=$NODE_ENV
ENV PORT=$PORT
ENV MONGODB_URI=$MONGODB_URI
ENV CORS_ORIGIN=$CORS_ORIGIN

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Create necessary directories
RUN mkdir -p data uploads

# Expose the API port
EXPOSE $PORT

# Start the server
CMD ["npm", "start"]
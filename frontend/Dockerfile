FROM node:20-alpine as build

WORKDIR /app

# Accept build arguments from docker-compose
ARG VITE_API_URL
ARG VITE_API_ENDPOINT
ARG VITEVITE_API_TARGET

# Set environment variables for build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_API_ENDPOINT=$VITE_API_ENDPOINT
ENV VITEVITE_API_TARGET=$VITEVITE_API_TARGET
# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
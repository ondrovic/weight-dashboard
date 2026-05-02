# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
ARG VITE_API_URL
ARG VITE_API_ENDPOINT
ARG VITE_API_TARGET
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_API_ENDPOINT=$VITE_API_ENDPOINT
ENV VITE_API_TARGET=$VITE_API_TARGET
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine-slim
RUN apk add --no-cache curl gettext
COPY nginx.conf.template /etc/nginx/conf.d/nginx.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
# nginx:alpine starts master as root so it can bind to port 80, then drops to worker processes
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://127.0.0.1/health || exit 1
EXPOSE 80
CMD ["/bin/sh", "-c", "echo VITE_API_URL=$VITE_API_URL && envsubst '\\$VITE_API_URL' < /etc/nginx/conf.d/nginx.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]

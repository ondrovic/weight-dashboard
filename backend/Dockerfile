# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Generate Swagger docs
RUN npm run swagger:generate-docs
RUN npm run build
# Debug: Show build output
RUN ls -R dist
RUN ls -R docs
# Clean up
RUN rm -rf node_modules

# Production stage
FROM node:20-alpine
WORKDIR /app
ARG NODE_ENV=production
ARG PORT=3001
ARG MONGODB_URI
ARG CORS_ORIGIN
ENV NODE_ENV=$NODE_ENV
ENV PORT=$PORT
ENV MONGODB_URI=$MONGODB_URI
ENV CORS_ORIGIN=$CORS_ORIGIN
COPY package*.json ./
RUN npm install --omit=dev && npm prune --production
RUN apk add --no-cache curl && apk cache clean
COPY --from=build /app/dist ./dist
# Copy swagger.json for runtime
COPY --from=build /app/docs/swagger.json ./docs/swagger.json
RUN ls -R dist
RUN ls -R docs
RUN mkdir -p data uploads && chown -R node:node /app
USER node
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -f http://127.0.0.1:${PORT:-3001}/health || exit 1
EXPOSE ${PORT:-3001}
CMD ["node", "dist/index.js"]
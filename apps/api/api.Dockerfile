FROM node:20-alpine AS build
WORKDIR /app

# Copy root workspace files
COPY package*.json ./
COPY turbo.json ./
# Copy workspaces
COPY apps/api ./apps/api
COPY packages ./packages

# Install and build
RUN npm ci
RUN npx turbo run build --filter=api

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy node_modules and built dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/package.json ./

EXPOSE 8080
USER node
CMD ["node", "dist/server.js"]

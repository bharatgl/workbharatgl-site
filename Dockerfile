# Cloud Run image: builds the site, then runs server.js (API routes + the built site).
FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
# api/ reads the case file from src/content.js, so the sources ship alongside dist/
COPY --from=build /app/dist ./dist
COPY api ./api
COPY src ./src
COPY server.js ./
USER node
EXPOSE 8080
CMD ["node", "server.js"]

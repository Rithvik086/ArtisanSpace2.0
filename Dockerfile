# ----------------- BASE IMAGE ------------------------
FROM node:24-alpine3.23 AS base
WORKDIR /app

#----------------- FRONTEND BUILDER ------------------------
FROM base AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package*.json ./

RUN npm ci

COPY frontend/ ./

ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

RUN npm run build

#----------------- BACKEND BUILDER ------------------------
FROM base AS backend-builder

WORKDIR /app/backend
COPY backend/package*.json ./

RUN npm ci

COPY backend/ ./

RUN npm run build

RUN npm prune --omit=dev

#----------------- FINAL IMAGE ------------------------
FROM node:24-alpine3.23 AS runner

ARG PORT
ARG NODE_ENV=production
ENV PORT=$PORT
ENV NODE_ENV=$NODE_ENV

WORKDIR /app

COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules

COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/package*.json ./backend/

COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

RUN mkdir -p /app/backend/logs && chown -R node:node /app/backend/logs

USER node

EXPOSE $PORT

CMD ["node", "backend/dist/index.js"]
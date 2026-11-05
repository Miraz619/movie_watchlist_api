
# Stage 1: Build TypeScript
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build


# Stage 2: Install production dependencies
FROM node:22-alpine AS deps

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev


# Stage 3: Run the application
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package.json ./

COPY --from=deps /app/node_modules ./node_modules

COPY --from=build /app/dist ./dist

USER node

EXPOSE 4000

CMD ["node", "dist/src/server.js"]
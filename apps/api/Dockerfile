FROM node:20-alpine AS base
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 express
WORKDIR /app

FROM base AS deps
COPY --chown=nodejs:nodejs package.json pnpm-lock.yaml* yarn.lock* package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm \
    if [ -f package-lock.json ]; then npm ci --production=false; \
    elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm install --frozen-lockfile=false; \
    elif [ -f yarn.lock ]; then corepack enable yarn && yarn install --frozen-lockfile=false; \
    else npm install; fi

FROM base AS builder
COPY --chown=nodejs:nodejs --from=deps /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs . .
RUN npx prisma generate
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
RUN rm -rf /usr/local/lib/node_modules /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/node
COPY --chown=nodejs:nodejs --from=builder /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs --from=builder /app/dist ./dist
COPY --chown=nodejs:nodejs --from=builder /app/prisma ./prisma
COPY --chown=nodejs:nodejs --from=builder /app/package.json ./package.json
USER express
EXPOSE 4000
ENV PORT=4000
CMD ["node", "dist/index.js"]

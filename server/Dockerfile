# ---------- Dependencies ----------
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# ---------- Runtime ----------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 expressjs

COPY --from=deps /app/node_modules ./node_modules
COPY --chown=expressjs:nodejs . .

USER expressjs
EXPOSE 5000

CMD ["node", "src/server.js"]

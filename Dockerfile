# syntax=docker/dockerfile:1
FROM node:24-alpine AS builder
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

COPY package*.json ./
RUN npm ci
COPY . .
# Change this non-secret value when rebuilding content without a source change.
ARG CONTENT_BUILD_REVISION=local
RUN --mount=type=secret,id=API_URL,env=API_URL,required=true \
    --mount=type=secret,id=PUBLIC_APP_KEY,env=PUBLIC_APP_KEY,required=true \
    test -n "$CONTENT_BUILD_REVISION" && test -n "$API_URL" && test -n "$PUBLIC_APP_KEY" && npm run build

FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]

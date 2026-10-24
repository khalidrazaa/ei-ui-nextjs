# syntax=docker/dockerfile:1
FROM node:24-alpine AS builder
WORKDIR /app

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1

COPY package*.json ./
RUN npm ci
COPY . .
# Refresh article content when rebuilding without a source change.
ARG CONTENT_BUILD_REVISION=local
RUN --mount=type=secret,id=API_URL,env=API_URL,required=true \
    --mount=type=secret,id=PUBLIC_APP_KEY,env=PUBLIC_APP_KEY,required=true \
    test -n "$CONTENT_BUILD_REVISION" && npm run build

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

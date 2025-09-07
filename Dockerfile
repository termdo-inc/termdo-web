# >-----< BASE STAGE >-----< #

FROM node:24.6-alpine AS base

ENV CI=true

# >-----< INSTALL STAGE >-----< #

FROM base AS installer

WORKDIR /app/

COPY \
  package-lock.json \
  package.json ./

RUN npm clean-install

# >-----< BUILD STAGE >-----< #

FROM base AS builder

ARG PUBLIC_APP_ENV
ARG PUBLIC_APP_VER

ENV PUBLIC_APP_ENV=${PUBLIC_APP_ENV}
ENV PUBLIC_APP_VER=${PUBLIC_APP_VER}

WORKDIR /app/

COPY --from=installer /app/node_modules/ node_modules/
COPY public/ public/
COPY source/ source/
COPY \
  index.html \
  package.json \
  tsconfig.app.json \
  tsconfig.json \
  tsconfig.node.json \
  vite.config.ts ./

RUN \
  npm run build && \
  npm prune --omit=dev

# >-----< TEST STAGE >-----< #

FROM builder AS tester

RUN npm run test

# >-----< RUN STAGE >-----< #

FROM nginx:1.29-alpine-slim AS runner

COPY --from=builder /app/out/ /usr/share/nginx/html/
COPY server/nginx.conf.template /etc/nginx/templates/default.conf.template

FROM node:22-bookworm-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# Existing zip was built for Cloudflare; rebuild for a Node container.
ENV NITRO_PRESET=node-server
RUN npm run build

FROM node:22-bookworm-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

RUN apt-get update \
  && apt-get install -y --no-install-recommends zip unzip \
  && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/.output ./.output
COPY --from=build /app/package.json ./package.json

# Persist CMS data / uploads via bind mounts at runtime.
RUN mkdir -p /app/.data /app/.data/backups /app/.output/public/cms-uploads

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]

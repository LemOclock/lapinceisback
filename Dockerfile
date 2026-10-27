FROM node:22-bookworm-slim

ENV NODE_ENV=production
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --chown=node:node . .

USER node
EXPOSE 3000

# Crée les tables manquantes + catégories système (idempotent), puis lance l'API
CMD ["sh", "-c", "node sync.js && node seed.js && exec node index.js"]

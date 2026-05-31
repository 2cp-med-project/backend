FROM node:22-alpine AS base
WORKDIR /usr/src/app
RUN chown node:node /usr/src/app

FROM base AS dev
COPY --chown=node:node package*.json ./
RUN npm install
COPY --chown=node:node . .
USER node
EXPOSE 5000
CMD ["npm", "run", "dev"]

FROM base AS prod
COPY --chown=node:node package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --chown=node:node . .
USER node
EXPOSE 5000
CMD [ "node", "src/app.js" ]
FROM node:22-alpine

ENV NODE_ENV=production

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./

RUN npm ci --omit=dev

COPY --chown=node:node . .

USER node

EXPOSE 5000

CMD ["node", "src/app.js"]
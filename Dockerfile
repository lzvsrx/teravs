FROM node:24-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY server ./server
COPY config ./config
COPY LICENSE AUTHORSHIP.md THIRD_PARTY_NOTICES.md ./
COPY docs/legal/third-party ./docs/legal/third-party
ENV HOST=0.0.0.0 PORT=4318 TERAVS_DB=/tmp/teravs.sqlite
EXPOSE 4318
USER node
CMD ["node", "server/index.mjs"]

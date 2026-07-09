FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY . .

EXPOSE 3200

# npm ci запускается только если node_modules пустой (первый старт).
# Named volume /app/node_modules сохраняет зависимости между перезапусками.
CMD ["sh", "-c", "[ -d node_modules/.bin ] || npm ci && npm run dev"]

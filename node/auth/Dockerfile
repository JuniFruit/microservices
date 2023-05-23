FROM node:16-alpine AS builder

WORKDIR /app

COPY . .
RUN npm run build

FROM node:16-alpine AS final

WORKDIR /app

COPY --from=builder ./app/build ./build
COPY package.json .
COPY package-lock.json .

RUN npm ci --omit=dev

EXPOSE 5000

CMD [ "node", "./build/app.js"]

FROM node:19-alpine

WORKDIR /app

COPY package.*json ./

RUN rm -rf node_modules && npm i

COPY . .


CMD ["npm", "run", "dev"]
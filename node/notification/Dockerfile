FROM node:17-alpine

WORKDIR /usr/app

COPY package.*json ./

RUN rm -rf node_modules && npm i

COPY . .


CMD ["npm", "run", "dev"]
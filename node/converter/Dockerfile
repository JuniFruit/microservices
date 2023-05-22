FROM node:16

WORKDIR /usr/src/app

COPY package.*json ./

RUN rm -rf node_modules && npm i

COPY . .


CMD ["npm", "run", "dev"]
FROM node:19-alpine

WORKDIR /app

COPY package.*json ./

RUN rm -rf node_modules && npm i

COPY . .

EXPOSE 6001

CMD ["npm", "run", "dev"]
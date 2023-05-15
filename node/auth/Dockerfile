FROM node:19-alpine

WORKDIR /app

COPY package.*json ./

RUN rm -rf node_modules && npm i

COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]
FROM node:16

WORKDIR /usr/src/app

COPY package.*json ./
COPY tsconfig.json ./
COPY t.ts ./

RUN rm -rf node_modules && npm run build

COPY . .

EXPOSE 5000

CMD ["npm", "run", "start"]
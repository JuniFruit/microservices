FROM node:19-alpine

WORKDIR /app

COPY package.json .

RUN npm run build

COPY . .


CMD ["npm", "run", "dev"]
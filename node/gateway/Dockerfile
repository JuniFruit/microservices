FROM node:19-alpine

WORKDIR /app

COPY package.json .

RUN npm run build

COPY . .

EXPOSE 6001

CMD ["npm", "run", "dev"]
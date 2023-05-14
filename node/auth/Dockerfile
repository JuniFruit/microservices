FROM node:19-alpine

WORKDIR /app

COPY package.json .

RUN npm run build

COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]
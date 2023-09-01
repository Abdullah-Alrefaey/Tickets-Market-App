FROM node:alpine

LABEL authors="Abdullah"

WORKDIR /app

COPY package.json .
RUN npm install --omit=dev
COPY . .

CMD ["npm", "start"]
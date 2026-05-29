FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY src ./src

EXPOSE 3500

CMD ["npm", "start"]

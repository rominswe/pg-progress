FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
RUN apk add --no-cache netcat-openbsd
COPY . .
CMD ["npm", "run", "dev"]
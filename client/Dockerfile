FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
CMD ["npm", "run", "dev"]
RUN apk add --no-cache netcat-openbsd
EXPOSE 5173

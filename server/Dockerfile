FROM node:22-alpine

WORKDIR /app

# Copy dependencies
COPY package*.json ./

# Install all dependencies
RUN npm install

# Install any utilities needed
RUN apk add --no-cache netcat-openbsd

# Copy app files
COPY . .

# Expose your API port
EXPOSE 5000

# Start backend (use 'npm start' for production or stable run)
CMD ["npm", "start"]
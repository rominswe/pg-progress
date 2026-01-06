FROM node:22-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install all dependencies (use npm install to ensure new ones are fetched)
RUN npm install

# Copy the rest of the app
COPY . .

# Install any needed system packages
RUN apk add --no-cache netcat-openbsd

# Expose Vite's dev port
EXPOSE 5173

# Start the Vite dev server
CMD ["npm", "run", "dev"]
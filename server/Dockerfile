# Use a lightweight Node.js image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of your backend code
COPY . .

# Expose the port your backend listens on (e.g., 3000)
EXPOSE 8081

# Start the app
CMD ["node", "server.js"]

# Use the official Node.js 20 Alpine image as the base image
FROM  node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if present) to the working directory
COPY package*.json .

# Install  dependencies 
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .


# Expose port 3000 to allow outside access to the application
EXPOSE 3000

# Command to start the application when the container starts
CMD [ "npm","start" ]

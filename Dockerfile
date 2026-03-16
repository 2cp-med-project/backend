FROM node:20 
# Set the working directory in the container
WORKDIR /app

COPY package*.json ./
# install dependencies
RUN npm install
# copy the rest of the application code
COPY . .
# set environment variables
ENV PORT=5000
# expose the port the app runs on
EXPOSE 5000
# start the application
CMD ["npm", "start"]
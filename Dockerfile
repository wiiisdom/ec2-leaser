FROM node:9-alpine
ENV NODE_ENV=production

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# If you are building your code for production
RUN npm install --only=production

# Bundle app source
COPY . .

# Build client side
RUN npm run buildclient

EXPOSE 5000
CMD [ "npm", "start" ]
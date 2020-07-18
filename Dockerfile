FROM node:alpine

RUN mkdir -p /app
WORKDIR /app

RUN npm install --global nodemon

COPY package*.json ./
RUN npm install --quiet --no-optional

EXPOSE ${NODEJS_PORT}

CMD nodemon server.js
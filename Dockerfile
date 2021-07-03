FROM node:alpine

RUN mkdir -p /app
WORKDIR /app/api

RUN npm install --global nodemon

COPY ./api/package*.json ./
RUN npm install --quiet --no-optional

EXPOSE ${NODEJS_PORT}

CMD nodemon index.js
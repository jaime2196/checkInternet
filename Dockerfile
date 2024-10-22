FROM node:16
ENV TZ="Europe/Madrid"
WORKDIR /usr/src/app
COPY . .
RUN npm install
CMD ["npm", "run", "start"]
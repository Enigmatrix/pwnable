FROM node:11.3-slim
EXPOSE 3000
COPY ./package*.json /app/
WORKDIR /app
RUN npm install
COPY . /app/
ENTRYPOINT ["npm", "run", "production"]
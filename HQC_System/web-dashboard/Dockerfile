FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ENV NODE_ENV=production
RUN npm run build
RUN npm install -g serve
EXPOSE 80
CMD ["serve", "-s", "out", "-p", "80"]

FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
EXPOSE 7000
CMD ["sh", "-c", "npx prisma db push && npm start"]

FROM mcr.microsoft.com/playwright:v1.40.1-jammy
WORKDIR /app
COPY package*.json ./
RUN npm ci
RUN playwright install chromium
COPY src ./src
COPY tsconfig.json .
EXPOSE 4000
CMD ["npm", "start"]

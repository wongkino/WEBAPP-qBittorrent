FROM node:22-alpine
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json ./
RUN npm ci

CMD ["npm", "run", "dev", "--", "-H", "0.0.0.0", "-p", "3000"]

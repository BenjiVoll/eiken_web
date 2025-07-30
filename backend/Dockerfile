FROM ubuntu:20.04

ENV DEBIAN_FRONTEND=noninteractive

# Instala Node.js 20.x, npm, git y dependencias básicas
RUN apt-get update \
    && apt-get install -y curl gnupg git \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g pm2 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 80

CMD ["pm2-runtime", "src/index.js"]
FROM node:16.14

ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV PATH=$PATH:/home/node/.npm-global/bin

RUN apt update && apt install python -y

RUN mkdir -p /home/node/hardhat && \
    chown -R node:node /home/node/hardhat

WORKDIR /home/node/hardhat

COPY --chown=node:node ./hardhat.config.ts ./hardhat.config.ts
COPY --chown=node:node ./hardhat-package.json ./package.json

USER node

RUN npm i

EXPOSE 8545

CMD ["npx", "hardhat", "node"]
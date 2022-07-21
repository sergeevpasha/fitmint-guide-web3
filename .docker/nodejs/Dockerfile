FROM node:16.15

ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV PATH=$PATH:/home/node/.npm-global/bin

RUN mkdir -p /home/node/app/node_modules && \
    mkdir -p /home/node/app/artifacts/build-info && \
    mkdir -p /home/node/app/deployments && \
    mkdir -p /home/node/app/cache && \
    mkdir -p /home/node/app/typechain && \
    chown -R node:node /home/node/app

WORKDIR /home/node/app

USER node

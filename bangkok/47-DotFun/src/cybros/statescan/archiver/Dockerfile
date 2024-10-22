FROM node:20-alpine

RUN apk update && apk add --no-cache build-base git

ARG STATE_SCAN_META_GIT_REPO="https://github.com/opensquare-network/blockmeta.git"
ARG STATE_SCAN_META_GIT_TAG="main"
RUN git clone --depth 1 --recurse-submodules --shallow-submodules -j 8 -b ${STATE_SCAN_META_GIT_TAG} ${STATE_SCAN_META_GIT_REPO} /opt/blockmeta

WORKDIR /opt/blockmeta

RUN npm install pm2 -g
RUN yarn

ADD ecosystem.config.js ./
# ADD ./src ./src

ENV MONGO_CONNECTION_STRING="mongodb://mongo:mongo@127.0.0.1:27017/"
ENV SUB_WS_RPC_ENDPOINT=""
ENV SUB_CHAIN_NAME=""
ENV SCAN_STEP="10"
ENV SCAN_FROM_LATEST="0"
ENV SAVE_VALIDATOR="true"

CMD ["pm2-runtime", "ecosystem.config.js"]

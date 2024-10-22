FROM node:20-alpine

RUN apk update && apk add --no-cache build-base git

ARG STATE_SCAN_GIT_REPO="https://github.com/opensquare-network/statescan-v2.git"
ARG STATE_SCAN_GIT_TAG="main"
RUN git clone --depth 1 --recurse-submodules --shallow-submodules -j 8 -b ${STATE_SCAN_GIT_TAG} ${STATE_SCAN_GIT_REPO} /opt/statescan

WORKDIR /opt/statescan

RUN npm install pm2 -g
RUN for d in /opt/statescan/backend/packages/*/; \
    do \
      cd "${d}" && test -r package.json && yarn; \
    done

ADD ecosystem.config.js ./
ADD ./packages ./backend/packages

ENV MONGO_CONNECTION_STRING="mongodb://mongo:mongo@127.0.0.1:27017/"
ENV SUB_WS_RPC_ENDPOINT=""
ENV SUB_CHAIN_NAME=""
ENV SCAN_STEP="10"
ENV USE_META="0"

CMD ["pm2-runtime", "ecosystem.config.js"]

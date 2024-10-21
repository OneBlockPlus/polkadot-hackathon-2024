FROM node:20-alpine as builder

RUN apk update && apk add --no-cache build-base git

ARG STATE_SCAN_GIT_REPO="https://github.com/opensquare-network/statescan-v2.git"
ARG STATE_SCAN_GIT_TAG="main"
RUN git clone --depth 1 --recurse-submodules --shallow-submodules -j 8 -b ${STATE_SCAN_GIT_TAG} ${STATE_SCAN_GIT_REPO} /opt/statescan

WORKDIR /opt/statescan/site

RUN yarn

ADD ./src ./src

ARG REACT_APP_PUBLIC_IDENTITY_SERVER_HOST=""
ARG REACT_APP_PUBLIC_API_END_POINT=""
ARG REACT_APP_PUBLIC_IDENTITY_API_END_POINT=""
ARG REACT_APP_PUBLIC_CHAIN=""
ARG REACT_APP_DEFAULT_IPFS_GATEWAY=""

RUN yarn build

FROM nginx:stable

COPY --from=builder /opt/statescan/site/build /usr/share/nginx/html

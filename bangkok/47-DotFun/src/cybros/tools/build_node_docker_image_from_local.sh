#!/usr/bin/env sh
set -e

# The following lines ensure we run from the project root
PROJECT_ROOT=$(dirname $(dirname "$(readlink -f "$0")"))
cd "$PROJECT_ROOT"

DOCKER_ORG=cybros-network
DOCKER_REPO=node
DOCKER_TAG=latest

# Build the image
echo "Building ${DOCKER_ORG}/${DOCKER_REPO}:${DOCKER_TAG} docker image, hang on!"
time docker build -t ${DOCKER_ORG}/${DOCKER_REPO}:${DOCKER_TAG} .

# Show the list of available images for this repo
echo "Image is ready"
docker images | grep ${DOCKER_REPO}

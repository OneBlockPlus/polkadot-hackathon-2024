docker build -f Dockerfile -t jupyter-server .
docker run -ti --rm --runtime=nvidia --gpus all --ipc=host -p 8888:8888 -v $(pwd)/data:/data jupyter-server

https://hub.docker.com/r/huggingface/transformers-pytorch-gpu/dockerfile
https://github.com/jupyter/docker-stacks/blob/main/images/base-notebook/Dockerfile

jupyter server --IdentityProvider.token="" --port 8080 --ip=0.0.0.0 --allow-root

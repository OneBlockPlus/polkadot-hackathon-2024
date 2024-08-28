FROM nvidia/cuda:12.6.0-cudnn-devel-ubuntu22.04
LABEL maintainer="Jasl"

ARG DEBIAN_FRONTEND=noninteractive

# Fix: https://github.com/hadolint/hadolint/wiki/DL4006
# Fix: https://github.com/koalaman/shellcheck/wiki/SC3014
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# Pytorch and HuggingFace

RUN apt update
RUN apt install -y openmpi-bin libopenmpi-dev git git-lfs libsndfile1-dev tesseract-ocr espeak-ng python3 python3-venv python3-pip python-is-python3 ffmpeg
RUN python3 -m pip install --no-cache-dir --upgrade pip
RUN python3 -m pip install --no-cache-dir setuptools

ARG REF=main
RUN git clone https://github.com/huggingface/transformers && cd transformers && git checkout $REF

# Example: `cu102`, `cu113`, etc.
ARG CUDA='cu124'
# If set to nothing, will install the latest version
ARG PYTORCH='2.4.0'
ARG TORCH_VISION=''
ARG TORCH_AUDIO=''

RUN [ ${#PYTORCH} -gt 0 ] && VERSION='torch=='$PYTORCH'.*' ||  VERSION='torch'; python3 -m pip install --no-cache-dir -U $VERSION --extra-index-url https://download.pytorch.org/whl/$CUDA
RUN [ ${#TORCH_VISION} -gt 0 ] && VERSION='torchvision=='TORCH_VISION'.*' ||  VERSION='torchvision'; python3 -m pip install --no-cache-dir -U $VERSION --extra-index-url https://download.pytorch.org/whl/$CUDA
RUN [ ${#TORCH_AUDIO} -gt 0 ] && VERSION='torchaudio=='TORCH_AUDIO'.*' ||  VERSION='torchaudio'; python3 -m pip install --no-cache-dir -U $VERSION --extra-index-url https://download.pytorch.org/whl/$CUDA

RUN pip install --no-cache-dir torch-tensorrt -f https://github.com/NVIDIA/Torch-TensorRT/releases

RUN python3 -m pip install --no-cache-dir -e ./transformers[dev-torch,testing,video]

RUN python3 -m pip uninstall -y tensorflow flax

RUN python3 -m pip install --no-cache-dir git+https://github.com/facebookresearch/detectron2.git pytesseract
RUN python3 -m pip install -U "itsdangerous<2.1.0"

# When installing in editable mode, `transformers` is not recognized as a package.
# this line must be added in order for python to be aware of transformers.
RUN cd transformers && python3 setup.py develop

# Selected AI stacks

ADD requirements.txt /root
RUN python3 -m pip install --no-cache-dir --verbose -r /root/requirements.txt --extra-index-url https://pypi.nvidia.com

# Jupyter server

# Minimum
# RUN python3 -m pip install --no-cache-dir jupyter-server jupyter-lsp ipykernel
# Possible useful extensions: jupyter-resource-usage jupyter_scheduler nbclassic
RUN python3 -m pip install --no-cache-dir jupyterlab jupytext voila ipywidgets gradio tensorboard nbclassic

COPY start_jupyter_server.sh /root

# Prepare environment
RUN useradd -m -U -s /bin/bash runner

USER runner
WORKDIR /home/runner

COPY jupyter_server_config.py /home/runner/.jupyter/

RUN python3 -m venv /home/runner/.local --system-site-packages
ENV PATH="/home/runner/.local/bin:${PATH}" 

USER runner
WORKDIR /home/runner

VOLUME /data
EXPOSE 8888

ENV HF_HOME=/data/huggingface

USER root
WORKDIR /root

CMD ["bash", "/root/start_jupyter_server.sh", "--IdentityProvider.token=''"]

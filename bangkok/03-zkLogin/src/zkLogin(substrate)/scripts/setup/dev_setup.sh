#!/bin/bash

sudo apt-get update
sudo apt-get install -y build-essential cmake pkg-config llvm-dev libclang-dev clang libssl-dev curl git protobuf-compiler

arch=$(uname -m)
ARCH=$arch
if [ 'x86_64' = "$arch" ]; then
  ARCH=amd64
fi
if [ 'aarch64' = "$arch" ]; then
  ARCH=aarch64
fi
if [ 'arm64' = "$arch" ]; then
  ARCH=aarch64
fi
OS=$(uname -s)
os=$(uname -s | tr '[:upper:]' '[:lower:]')

function install_rustup {
  echo "Installing Rust toolchain..."
  if rustup --version &> /dev/null; then
    echo "Rust toolchain is already installed"
  else
    curl https://sh.rustup.rs -sSf | sh -s -- -y --default-toolchain stable
    source "$HOME"/.cargo/env
  fi
  rustup show
}

function install_cargo_binary {
  CRATE_NAME=$1
  BIN_NAME=${2:-$1}
  if command -v "$BIN_NAME" &> /dev/null; then
    echo "$CRATE_NAME is already installed"
  else
    cargo install "$CRATE_NAME" --force --locked
  fi
}

install_rustup
mkdir -p $HOME/.cargo/bin

install_cargo_binary "cargo-license-template"
install_cargo_binary "cargo-expand"
# install_cargo_binary "taplo-cli" "taplo"
if command -v "taplo" &> /dev/null; then
  echo "taplo is already installed"
else
  wget https://github.com/tamasfe/taplo/releases/download/0.8.1/taplo-${os}-${ARCH}.gz -O taplo.gz
  gzip -d taplo.gz
  chmod +x taplo
  mv taplo $HOME/.cargo/bin/taplo
fi

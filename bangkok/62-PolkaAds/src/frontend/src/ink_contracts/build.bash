#!/bin/bash
cargo contract build --release;

seedfile() {
   mkdir -p "$(dirname "$1")"
   touch "$1"
}

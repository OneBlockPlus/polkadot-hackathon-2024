# pproxy

A proxy tool based on libp2p network

## Binary Install
Download the latest release from [Release Page](https://github.com/dephy-io/dephy-pproxy/releases).

You can also clone this repository then build it yourself:
```shell
cargo build --release
```

## Usage
This example shows you how to proxy a jupyter server from peer to local.

Run the jupyter backend on remote peer A.
```shell
jupyter server --NotebookApp.token="" --port 8080
```

Run the pproxy on remote peer A.
```shell
pproxy serve --server-addr 0.0.0.0:10010 --proxy-addr 127.0.0.1:8080
```

Run the pproxy on local peer B.
```shell
pproxy serve
```

Create a tunnel server locally that will transmit package to remote peer. Run the command on local peer B.
```shell
pproxy create_tunnel_server --tunnel-server-addr 127.0.0.1:8888 --peer-multiaddr <The litep2p multiaddr>
```

Access jupyter server from local peer B.
```shell
curl 127.0.0.1:8888
```

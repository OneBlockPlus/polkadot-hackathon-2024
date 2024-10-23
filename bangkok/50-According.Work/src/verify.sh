if [ -z "$1" ]; then
    echo "Usage: $0 <network>"
    exit 1
fi

source ../.env
NETWORK=$1

export ETHERSCAN_API_KEY=GDZ3MVC8T2JG74ND4XFQRXTISJ25H9C3UP
forge verify-contract 0xD5C57B49b58744202EB1e67F4b7e6cB1aD06844f Bet --compiler-version v0.8.13 --rpc-url $NETWORK \
    --verifier blockscout \
    --verifier-url https://opencampus-codex.blockscout.com/api

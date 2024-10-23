if [ -z "$1" ]; then
    echo "Usage: $0 <network>"
    exit 1
fi

source ../.env
NETWORK=$1

forge create --gas-price 10gwei --rpc-url $NETWORK src/Bet.sol:Bet --private-key $PRIVATE_KEY
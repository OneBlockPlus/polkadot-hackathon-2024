forge clean 

source .env 

forge script \
    script/BetUpgrade.s.sol:BetScript \
    --rpc-url https://rpc.open-campus-codex.gelato.digital \
    -g 20000 \
    --broadcast \
    --verify \
    --verifier blockscout \
    --verifier-url https://opencampus-codex.blockscout.com/api/ \
    -vvvv
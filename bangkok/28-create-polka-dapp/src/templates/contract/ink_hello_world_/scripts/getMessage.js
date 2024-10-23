import { interact } from "../utils/interact";

const CONTRACT_ADDRESS = "";

async function main() {
  const message = await interact(
    "local",
    "ink_hello_world",
    CONTRACT_ADDRESS,
    "get_message"
  );

  console.log("Message:", message);
}

main();

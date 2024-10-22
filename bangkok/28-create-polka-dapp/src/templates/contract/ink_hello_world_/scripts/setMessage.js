import { interact } from "../utils/interact.js";

const CONTRACT_ADDRESS = "";

async function main() {
  await interact(
    "local",
    "ink_hello_world",
    CONTRACT_ADDRESS,
    "set_message",
    "Hello, world!"
  );

  console.log("Message set successfully");
}

main();

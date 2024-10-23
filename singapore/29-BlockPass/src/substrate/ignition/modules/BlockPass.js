const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("BlockPassModule", (m) => {
  const eventDetails = m.getParameter("eventDetails", {
    title: "Sample Event",
    date: 1893456000, // Example timestamp (Jan 1st, 2030)
  });

  // Deploy the BlockPass contract with the specified parameters
  const blockPass = m.contract("BlockPass", [ownerAddress, eventDetails]);

  return { blockPass };
});


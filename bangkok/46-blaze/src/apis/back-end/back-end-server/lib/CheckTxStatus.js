
/*const axios = require("axios");
const { MOONBASE_ALPHA, MOONBEAM } = require("../constants");

const checkTxStatus = async (txId) => {
  try {
    const requestData = {
      jsonrpc: "2.0",
      id: 1,
      method: "moon_isTxFinalized",
      params: [txId],
    };

    // POST request to Moonbeam RPC endpoint
    const response = await axios.post(MOONBASE_ALPHA, requestData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response?.status === 200) {
      const { result } = response.data;
      console.log("the on-chain result", result)

      // Return "YES" if transaction is finalized, otherwise "NO"
      console.log("tx status", response.status)
      return result === true ? "SUCCESS" : "FAILED";
    } else {
      // In case the API returns an unexpected status code
      console.log("failed status", response.status)
      return "FAILED";
    }
  } catch (error) {
    console.error("Error checking transaction status:", error);
    return "FAILED";
  }
};

module.exports = { checkTxStatus };*/

const axios = require("axios");
const { MOONBASE_ALPHA, MOONBEAM } = require("../constants");

// Retry configuration
const MAX_RETRIES = 50;  // Number of times to retry before giving up
const RETRY_DELAY = 10000;  // Delay between retries (in milliseconds)

const checkTxStatus = async (txId) => {
  console.log("transaction hash from checker", txId)
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const requestData = {
        jsonrpc: "2.0",
        id: 1,
        method: "moon_isTxFinalized",
        params: [txId],
      };

      // POST request to Moonbeam RPC endpoint
      const response = await axios.post(MOONBASE_ALPHA, requestData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response?.status === 200) {
        const { result } = response.data;
        console.log("On-chain result:", result);
        console.log(`Attempt ${attempt}: Transaction status`, response.status);

        // Return "SUCCESS" if transaction is finalized, otherwise retry
        if (result === true) {
          return "SUCCESS";
        }
      } else {
        console.log(`Attempt ${attempt}: Failed status ${response.status}`);
      }
    } catch (error) {
      console.error(`Attempt ${attempt}: Error checking transaction status:`, error);
    }

    // Wait for the specified delay before the next retry
    console.log(`Waiting for ${RETRY_DELAY / 1000} seconds before retrying...`);
    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
  }

  // If all retries fail, return "FAILED"
  return "FAILED";
};

module.exports = { checkTxStatus };


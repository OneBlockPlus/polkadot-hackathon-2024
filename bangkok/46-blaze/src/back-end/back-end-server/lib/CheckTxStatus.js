
const axios = require("axios");
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

      // Return "YES" if transaction is finalized, otherwise "NO"
      return result === true ? "SUCCESS" : "FAILED";
    } else {
      // In case the API returns an unexpected status code
      return "FAILED";
    }
  } catch (error) {
    console.error("Error checking transaction status:", error.message);
    return "FAILED";
  }
};

module.exports = { checkTxStatus };

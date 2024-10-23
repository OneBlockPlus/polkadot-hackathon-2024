export async function getQuote(
  token0Addr,
  token1Addr,
  amountIn,
  account,
  slippage,
) {
  return new Promise((resolve, reject) => {
    const requestOptions = {
      method: 'GET',
      redirect: 'follow',
    };

    fetch(
      `https://router-api.stellaswap.com/api/v2/quote/${token0Addr}/${token1Addr}/${amountIn}/${account}/${slippage}`,
      requestOptions,
    )
      .then(response => response.json())
      .then(result => {
        if (parseInt(result.result.amountOut) > 0) {
          resolve(result.result);
        } else {
          reject(result.result);
        }
      })
      .catch(error => reject(error));
  });
}

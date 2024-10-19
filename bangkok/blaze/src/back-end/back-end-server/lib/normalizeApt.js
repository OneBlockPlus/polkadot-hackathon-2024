const  BigNumber = require('bignumber.js');

  export const toHumanReadable  = (amount, decimals) => {
    return new BigNumber(amount).dividedBy(new BigNumber(10).pow(decimals)).toString();
}



 const  toSmallestUnitAPT  =(amount, decimals) =>  {
    return amount * Math.pow(10, decimals);
}


module.exports = {toSmallestUnitAPT}
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
// const { web3Accounts, web3Enable, web3FromAddress } = require('@polkadot/extension-dapp');

document.getElementById('submit')?.addEventListener('click', async () => {
  console.log("11111111111111111111");
  
  const allInjected = await web3Enable('my cool dapp');
  
  const allAccounts = await web3Accounts();
  
});

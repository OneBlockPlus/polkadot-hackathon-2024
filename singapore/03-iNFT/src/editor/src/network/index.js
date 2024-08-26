const map={
  aptos:null,
  polkadot:null,
  solana:null,
  partisia:null,
  sui:null,
  ton:null,
  ether:null,
}

const Router={
  subscribe:(name,ck)=>{   //subscribe the latest block

  },
  view:(block,ck)=>{     //view data on different networks

  },
  transaction:(hash,ck)=>{  //do the transaction on different networks

  },
  wallet:(ck)=>{     //connect to wallet

  },
  balance:()=>{     //get the balance value of account

  },
  storage:(data,ck)=>{  //save data to different networks

  },
  mint:(target,sign,ck)=>{    //mint an iNFT actually

  },
}

export default Router;
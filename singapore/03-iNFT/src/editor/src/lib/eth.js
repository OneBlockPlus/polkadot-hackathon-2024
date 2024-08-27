import { ethers } from "ethers";

//https://docs.ethers.org/v6/getting-started/

const ETH= {
    init:()=>{
        return false;
        //console.log(ethers);

        //console.log(ethers.sha256("aaa"))
        let signer = null;

        let provider;
        if (window.ethereum == null) {

            // If MetaMask is not installed, we use the default provider,
            // which is backed by a variety of third-party services (such
            // as INFURA). They do not have private keys installed,
            // so they only have read-only access
            console.log("MetaMask not installed; using read-only defaults")
            provider = ethers.getDefaultProvider();

        } else {

            // Connect to the MetaMask EIP-1193 object. This is a standard
            // protocol that allows Ethers access to make all read-only
            // requests through MetaMask.
            provider = new ethers.BrowserProvider(window.ethereum)

            // It also provides an opportunity to request access to write
            // operations, which will be performed by the private key
            // that MetaMask manages for the user.
            provider.getSigner().then((ev)=>{
                console.log(ev);
            });
            provider.getBlockNumber().then((ev)=>{
                console.log(ev);
            });

            provider.getBalance("ethers.eth").then((ev)=>{
                console.log(ev);
            });
        }
    },
}

export default ETH;
import logo from './logo.svg';
import './App.css';
import { web3Accounts, web3AccountsSubscribe, web3Enable, web3FromAddress } from '@polkadot/extension-dapp';
import { ApiPromise, WsProvider } from '@polkadot/api';
// import { Extrinsic } from '@polkadot/types';

function App() {
  const upperCharAtIndex = (str, index) => {
    return str.charAt(index - 1).toUpperCase() + str.slice(index);
  };

  const lowerCharAtIndex = (str, index) => {
    return str.charAt(index - 1).toLowerCase() + str.slice(index);
  };

  async function submitExtrinsic(pallet_name, extrinsic_name, ...arg) {
    var allInjected = await web3Enable('my cool dapp');

    var SENDER;
    var wsProvider = new WsProvider('wss://testnet.vara.network/');
    var api = await ApiPromise.create({ provider: wsProvider });

    let allAccounts =  await web3Accounts();
    SENDER = allAccounts[0].address;

    console.log("account is", SENDER);
    // the address we use to use for signing, as injected
    // finds an injector for an address
    var injector = await web3FromAddress(SENDER);
    // let tx1 = "balances";
    let tx1 = 'balances';
    let tx2 = 'transferKeepAlive';
    let arr = ['5HpwqJq3fKspCpfStQYXbs4A6gxf1MVnUpgoggRVEqmrxD53', '10000000000000'];
    api.tx[tx1][tx2](...arr)
      .signAndSend(SENDER, { signer: injector.signer }, (status) => { console.log(status) });
    // unsubscribe && unsubscribe();
  }

  function parseUrl() {
    var url_string = window.location.href;
    var url = new URL(url_string);
    var path_list = url.pathname.split("/");

    var extrinsic_name = "";
    var name = path_list[3];
    var name_slice = name.split("_");
    extrinsic_name = extrinsic_name + lowerCharAtIndex(name_slice[0], 1);

    if (name_slice.length > 1) {
      for (let i = 1; i < name_slice.length; i++) {
        var upper_slice = name_slice[i];
        extrinsic_name = extrinsic_name + upperCharAtIndex(upper_slice, 1);
      }
    }

    var pallet_name = "";
    pallet_name = lowerCharAtIndex(path_list[2], 1);

    const queryParams = new URLSearchParams(url.search);
    var flag = queryParams.get('flag');
    console.log('Query parameter "flag":', flag);

    return [pallet_name, extrinsic_name, flag];
  }

  async function handleClick() {
    console.log(" pallet_name: ", pallet_name, " extrinsic_name: ", extrinsic_name);

    let list = document.getElementsByTagName("input");
    console.info(list);
    console.info(list.length);
    let args = [];
    for (let i = 0; i < list.length; i++) {
      args.push(list[i].value);
      console.log(list[i].value);
      console.log(list[i].id);
    }

    submitExtrinsic(pallet_name, extrinsic_name, ...args);
  }

  var [pallet_name, extrinsic_name, flag] = parseUrl();

  if (flag != null) {
    submitExtrinsic(pallet_name, extrinsic_name);
    window.open("https://x.com/YangElden65222");
  }

  return (
    <div className="App">
      <button className="button-wallet" onClick={handleClick}>Connect Wallet</button>
    </div>
  );
}

export default App;

import React from "react";
import { Link } from "react-router-dom";
import { CSSProperties } from 'react';




import {useBalance, useBlockHeader, useBlockHeaders, useCall, useCallSubscription, useChainRpc, useChainRpcList, useContract, useDryRun, useEventSubscription, useEvents, useInstalledWallets, useTx, useTxPaymentInfo, useUninstalledWallets, useWallet,} from 'useink';
import { RustResult, isBroadcast, isFinalized, isInBlock, isPendingSignature, pickDecoded, pickDecodedError, pickResultErr, pickResultOk, pickTxInfo, shouldDisable,} from 'useink/utils';
import { ChainId } from 'useink/chains';
import { useEffect, useMemo, useState } from 'react';
import { useNotifications, useTxNotifications } from 'useink/notifications';


import liquidStakingTokenCallWrapperMetadata from '../../../../metadata/liquid_staking_call_wrapper.json';
import augmeaStablecoinMetadata from '../../../../metadata/augmea_stablecoin.json';
import liquidStablecoinVaultMetadata from '../../../../metadata/liquid_stablecoin_vault.json';
import augmeaLendingProtocolMetadata from '../../../../metadata/augmea_lending_protocol.json';

export const FrameThree = (): JSX.Element => {
  ///////////////////////////////////////////////////////////////////////////////
  ///  WALLET INFRA SETUP  //////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////
  const installedWallets = useInstalledWallets();
  const uninstalledWallets = useUninstalledWallets();
  const { addNotification } = useNotifications();

  ///////////////////////////////////////////////////////////////////////////////
  ///  CONNECTED WALLET DATA  ///////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////
  const { account, accounts, setAccount, connect, disconnect } = useWallet();
  const balance = useBalance(account);

  ///////////////////////////////////////////////////////////////////////////////
  ///  WALLET PROVIDER SETUP  ///////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////
  const { rpcs, setChainRpc } = useChainRpcList('aleph-testnet');
  const aZeroTestnetRpc = useChainRpc('aleph-testnet');

  ///////////////////////////////////////////////////////////////////////////////
  ///  CHAIN DATA  //////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////
  const aZeroTestnetBlockNumber = useBlockHeader('aleph-testnet');

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///  AUGMEA STABLECOIN CONTRACT  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  ///////////////////////////////////////////////////////////////////////////////
  ///  SETUP  ///////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////
  const augmeaStablecoinScAddress = '5GuuHEF48acQHx6uNoigK9eY3rMyjrPantGKLVAkEufGW58X';
  const augmeaStablecoinScInstance = useContract(augmeaStablecoinScAddress, augmeaStablecoinMetadata, 'aleph-testnet');

  ///////////////////////////////////////////////////////////////////////////////
  ///  DATA SUBSCRIPTION  ///////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////
  const [augmeaStablecoinAddressToCheckBalance, setAugmeaStablecoinAddressToCheckBalance] = useState('');
  const [augmeaStablecoinAllowanceOwnerToCheck, setAugmeaStablecoinAllowanceOwnerToCheck] = useState('');
  const [augmeaStablecoinAllowanceSpenderToCheck, setAugmeaStablecoinAllowanceSpenderToCheck] = useState('');
  
  let subscriptionAugmeaStablecoinUserBalance = useCallSubscription<boolean>(augmeaStablecoinScInstance, 'balanceOf', [augmeaStablecoinAddressToCheckBalance]);
  let subscriptionAugmeaStablecoinAllowance = useCallSubscription<boolean>(augmeaStablecoinScInstance, 'allowance', [augmeaStablecoinAllowanceOwnerToCheck, augmeaStablecoinAllowanceSpenderToCheck]);

  ///////////////////////////////////////////////////////////////////////////////
  ///  TX CALLS  ////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////
  const [augmeaStablecoinAllowanceTxAddressToPermitParam, setAugmeaStablecoinAllowanceTxAddressToPermitParam] = useState('5CouKM5da5pNvR7azG3QuHhhBK3vLrr2uY9YWdsLqsFmgQ8n');
  const [augmeaStablecoinAllowanceTxQuantityToPermitParam, setAugmeaStablecoinAllowanceTxQuantityToPermitParam] = useState(0);
  const [augmeaStablecoinTransferTxAddressToTransferParam, setAugmeaStablecoinTransferTxAddressToTransferParam] = useState('5CouKM5da5pNvR7azG3QuHhhBK3vLrr2uY9YWdsLqsFmgQ8n');
  const [augmeaStablecoinTransferTxQuantityToTransferParam, setAugmeaStablecoinTransferTxQuantityToTransferParam] = useState(0);

  const augmeaStablecoinTxCallTransfer = useTx(augmeaStablecoinScInstance, 'transfer');
  const augmeaStablecoinTxCallSetAllowance = useTx(augmeaStablecoinScInstance, 'setAllowance');
  useTxNotifications(augmeaStablecoinTxCallTransfer);
  useTxNotifications(augmeaStablecoinTxCallSetAllowance);

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///  LIQUID STABLECOIN VAULT CONTRACT  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  ///////////////////////////////////////////////////////////////////////////////
  ///  SETUP  ///////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////
  const liquidStablecoinVaultScAddress = '5D7TKjKGLz6rBaEjwREWKmUxkN9UJQo7orP2FpcoqCKGfoLP';
  const liquidStablecoinScInstance = useContract(liquidStablecoinVaultScAddress, liquidStablecoinVaultMetadata, 'aleph-testnet');

  ///////////////////////////////////////////////////////////////////////////////
  ///  TX CALLS  ////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////
  const [liquidStablecoinVaultMintStablecoinTxLiquidAssetToUseParam, setLiquidStablecoinVaultMintStablecoinTxLiquidAssetToUseParam] = useState(0);

  const liquidStablecoinVaultTxCallMintStablecoin = useTx(liquidStablecoinScInstance, 'mintStablecoin');
  useTxNotifications(liquidStablecoinVaultTxCallMintStablecoin);



  const frameStyle: CSSProperties = {
    backgroundColor: '#000000',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  };

  const divStyle: CSSProperties = {
    backgroundColor: '#000000',
    height: '207px',
    position: 'relative',
    width: '315px',
  };

  const vectorStyle: CSSProperties = {
    height: '17px',
    left: '0',
    position: 'absolute',
    top: '190px',
    width: '315px',
  };

  const overlapStyle: CSSProperties = {
    height: '183px',
    left: '0',
    position: 'absolute',
    top: '0',
    width: '315px',
  };

  const overlapGroupStyle: CSSProperties = {
    height: '178px',
    left: '13px',
    position: 'absolute',
    top: '5px',
    width: '302px',
  };

  const imgStyle: CSSProperties = {
    height: '55px',
    left: '87px',
    position: 'absolute',
    top: '0',
    width: '215px',
  };

  const rectangles: CSSProperties[] = [
    { backgroundColor: '#97063a', border: '1px solid #ffffff', borderRadius: '7px', height: '125px', left: '0', position: 'absolute', top: '53px', width: '287px' },
    { backgroundColor: '#97063a', border: '1px solid #000000', borderRadius: '5px', height: '13px', left: '51px', position: 'absolute', top: '134px', width: '191px' },
    { backgroundColor: '#97063a', border: '1px solid #ffffff', borderRadius: '5px', height: '13px', left: '6px', position: 'absolute', top: '57px', width: '191px' },
    { backgroundColor: '#97063a', border: '1px solid #000000', borderRadius: '5px', height: '13px', left: '50px', position: 'absolute', top: '149px', width: '192px' },
    { backgroundColor: '#97063a', border: '1px solid #000000', borderRadius: '5px', height: '13px', left: '50px', position: 'absolute', top: '163px', width: '223px' },
    { backgroundColor: '#97063a', border: '1px solid #000000', borderRadius: '5px', height: '13px', left: '245px', position: 'absolute', top: '148px', width: '28px' },
    { backgroundColor: '#97063a', border: '1px solid #000000', borderRadius: '5px', height: '13px', left: '245px', position: 'absolute', top: '133.5px', width: '28px' },
    { backgroundColor: '#97063a', border: '1px solid #ffffff', borderRadius: '5px', height: '13px', left: '6px', position: 'absolute', top: '88px', width: '191px' },
    { backgroundColor: '#97063a', border: '1px solid #ffffff', borderRadius: '5px', height: '13px', left: '6px', position: 'absolute', top: '74px', width: '191px' },
    { backgroundColor: '#97063a', border: '1px solid #ffffff', borderRadius: '5px', height: '13px', left: '6px', position: 'absolute', top: '105px', width: '191px' },
    { backgroundColor: '#97063a', border: '1px solid #ffffff', borderRadius: '5px', height: '13px', left: '6px', position: 'absolute', top: '119px', width: '191px' },
    { backgroundColor: '#97063a', border: '1px solid #ffffff', borderRadius: '5px', height: '15px', left: '203px', position: 'absolute', top: '55px', width: '38px' },
    { backgroundColor: '#97063a', border: '1px solid #ffffff', borderRadius: '5px', height: '18px', left: '203px', position: 'absolute', top: '109px', width: '39px' },
    { backgroundColor: '#97063a', border: '1px solid #ffffff', borderRadius: '5px', height: '18px', left: '203px', position: 'absolute', top: '79px', width: '39px' },
  ];

  const textStyle = (top: number, left: number): CSSProperties => ({
    color: '#ffffff',
    fontFamily: '"Content", Helvetica, sans-serif',
    fontSize: '7px',
    fontWeight: '400',
    position: 'absolute',
    top: `${top}px`,
    left: `${left}px`
  });

  function displayFunc()
  {
    alert("helloWolrd");
  }

  function firstCheck()
  {
    setAugmeaStablecoinAddressToCheckBalance(account.address);
    setAugmeaStablecoinAllowanceOwnerToCheck(account.address);
  }



  return (
    <div style={{backgroundColor: 'black', paddingBottom: '100rem'}}>
      {
        !account &&
        (
          <div style={{justifyContent: 'center', width:'100%', display: 'flex', paddingBottom: '10px'}}>
            <ul className="flex flex-col gap-4">
            {
              installedWallets.length > 0 ?
              (
                <>
                  <h2 className="text-xl font-bold" style={{paddingTop: '100px'}}>Connect a Wallet</h2>
                  <h3 className="text-md" style={{top: '-100000px'}}>Installed Wallets</h3>

                  {
                    installedWallets.map
                    (
                      (w) => 
                      (
                        <li key={w.title}>
                          <button
                          onClick={() => connect(w.extensionName)}
                          className="flex items-center rounded-2xl text-white px-6 py-4 hover:bg-blue-600 transition duration-75"
                          style={{background: '#97063a'}}
                          >
                            <img className="w-12 mr-2" src={w.logo.src} alt={w.logo.alt} />
                        
                            Connect to {w.title}
                          </button>
                        </li>
                      )
                    )
                  }
                </>
              )
              :
              (
                <h2 className="text-xl font-bold">You don&apos;t have any wallets installed...</h2> 
              )
            }
            </ul>
          </div>
        )
      }

      {
        account &&
        (
          <>
            <div style={frameStyle}>
              <div style={divStyle}>
                <img style={vectorStyle} alt="Vector" src={require('./img/vector.svg')} />
                <div style={overlapStyle}>
                  <div style={overlapGroupStyle}>
                    <img style={imgStyle} alt="Vector" src="./img/vector-1.png" />

                    {rectangles.map((rectStyle, index) => (
                      <div key={index} style={rectStyle}></div>
                    ))}

                    <div style={textStyle(133, 55)}>Actual user augmeaStablecoin balance: {pickDecoded(subscriptionAugmeaStablecoinUserBalance.result)?.toString() || '--'}</div>

                    <div style={textStyle(56, 11)}>
                      quantityLiquidTokenToUseToMint:

                      <div style={{paddingLeft: '6.6rem', position: 'relative', top: '-8.26px'}}>
                        <input type="number" onChange={e => setLiquidStablecoinVaultMintStablecoinTxLiquidAssetToUseParam(e.target.value)} style={{height: '10px', width: '76.5px', backgroundColor: '#97063a', border: 'none', fontSize: '7px'}}></input>
                      </div>
                    </div>

                    <div style={textStyle(73, 11)}>
                      addressToPermitAllowance:

                      <div style={{paddingLeft: '5.5rem', position: 'relative', top: '-8.26px'}}>
                        <input onChange={e => setAugmeaStablecoinAllowanceTxAddressToPermitParam(e.target.value)} style={{height: '10px', width: '94px', backgroundColor: '#97063a', border: 'none', fontSize: '7px'}}></input>
                      </div>
                    </div>

                    <div style={textStyle(87, 11)}>
                      quantityToPermitAllowance:

                      <div style={{paddingLeft: '5.45rem', position: 'relative', top: '-8.26px'}}>
                        <input type="number" onChange={e => setAugmeaStablecoinAllowanceTxQuantityToPermitParam(e.target.value)} style={{height: '10px', width: '94px', backgroundColor: '#97063a', border: 'none', fontSize: '7px'}}></input>
                      </div>
                    </div>

                    <div style={textStyle(104, 11)}>
                      addressToTransferTokens:

                      <div style={{paddingLeft: '5.2rem', position: 'relative', top: '-8.26px'}}>
                        <input onChange={e => setAugmeaStablecoinTransferTxAddressToTransferParam(e.target.value)} style={{height: '10px', width: '98.5px', backgroundColor: '#97063a', border: 'none', fontSize: '7px'}}></input>
                      </div>
                    </div>

                    <div style={textStyle(118, 11)}>
                      quantityToTransfer:

                      <div style={{paddingLeft: '3.75rem', position: 'relative', top: '-8.26px'}}>
                        <input type="number" onChange={e => setAugmeaStablecoinTransferTxQuantityToTransferParam(e.target.value)} style={{height: '10px', width: '121.5px', backgroundColor: '#97063a', border: 'none', fontSize: '7px'}}></input>
                      </div>
                    </div>

                    <div style={textStyle(148, 54)}>
                      addressToCheckAllowance:

                      <div style={{paddingLeft: '5.4rem', position: 'relative', top: '-8.26px'}}>
                        <input onChange={e => setAugmeaStablecoinAllowanceSpenderToCheck(e.target.value)} style={{height: '10px', width: '96px', backgroundColor: '#97063a', border: 'none', fontSize: '7px'}}></input>
                      </div>
                    </div>

                    <div style={textStyle(162, 54)}>ALLOWANCE: {pickDecoded(subscriptionAugmeaStablecoinAllowance.result)?.toString() || '--'}</div>

                    <div style={textStyle(55, 213)}>
                      <button onClick={() => liquidStablecoinVaultTxCallMintStablecoin.signAndSend([liquidStablecoinVaultMintStablecoinTxLiquidAssetToUseParam])}>
                        {shouldDisable(liquidStablecoinVaultTxCallMintStablecoin) ? 'SETTING' : 'MINT'}
                      </button>
                    </div>

                    {/* FIRST CHECK BUTTON */}
                    <div style={textStyle(135, 247)}>
                      <button onClick={firstCheck}>CHECK</button>
                    </div>

                    {/* SECOND CHECK BUTTON */}
                    <div style={textStyle(149, 247)}>
                      <button onClick={displayFunc}>CHECK</button>
                    </div>

                    <div style={textStyle(80, 216)}>
                      <button onClick={() => augmeaStablecoinTxCallSetAllowance.signAndSend([augmeaStablecoinAllowanceTxQuantityToPermitParam, augmeaStablecoinAllowanceTxAddressToPermitParam])}>
                        {shouldDisable(augmeaStablecoinTxCallSetAllowance) ? 'SETTING' : 'SET'}
                      </button>
                    </div>

                    <div style={textStyle(110, 205)}>
                    <button onClick={() => augmeaStablecoinTxCallTransfer.signAndSend([augmeaStablecoinTransferTxQuantityToTransferParam, augmeaStablecoinTransferTxAddressToTransferParam])}>
                      {shouldDisable(augmeaStablecoinTxCallTransfer) ? 'SETTING' : 'TRANSFER'}
                    </button>
                    </div>

                    <div style={textStyle(14, 161)}>“Mint Augmea stablecoin”</div>
                  </div>
                  <img style={{ height: '32px', left: '18px', position: 'absolute', top: '13px', width: '32px' }} alt="Icon USD coin" src="./img/icon-usd-coin-cryptocurrency.png" />
                  <Link to="/">
                    <img style={{ height: '11px', left: '0', objectFit: 'cover', position: 'absolute', top: '0', width: '28px' }} alt="Image" src="./img/image-6.png" />
                  </Link>
                </div>
              </div>
            </div>
          </>
        )
      }
    </div>
  );
};
import React from "react";
import { Link } from "react-router-dom";
import { CSSProperties } from 'react';


import {useBalance, useBlockHeader, useBlockHeaders, useCall, useCallSubscription, useChainRpc, useChainRpcList, useContract, useDryRun, useEventSubscription, useEvents, useInstalledWallets, useTx, useTxPaymentInfo, useUninstalledWallets, useWallet,} from 'useink';
import { RustResult, isBroadcast, isFinalized, isInBlock, isPendingSignature, pickDecoded, pickDecodedError, pickResultErr, pickResultOk, pickTxInfo, shouldDisable,} from 'useink/utils';
import { ChainId } from 'useink/chains';
import { useEffect, useMemo, useState } from 'react';
import { useNotifications, useTxNotifications } from 'useink/notifications';
// import { Notifications } from '../Notifications';


import liquidStakingTokenCallWrapperMetadata from '../../../../metadata/liquid_staking_call_wrapper.json';
import augmeaStablecoinMetadata from '../../../../metadata/augmea_stablecoin.json';
import liquidStablecoinVaultMetadata from '../../../../metadata/liquid_stablecoin_vault.json';
import augmeaLendingProtocolMetadata from '../../../../metadata/augmea_lending_protocol.json';


export const FrameFour = (): JSX.Element => {
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
  ///  AUGMEA LENDING PROTOCOL CONTRACT  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  ///////////////////////////////////////////////////////////////////////////////
  ///  SETUP  ///////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////
  const augmeaLendingProtocolScAddress = '5CxVw4Gm7QJ2XWwF3KRFcZEjPjB2kc8doUZD7TbjCZWB6piX';
  const augmeaLendingProtocolScInstance = useContract(augmeaLendingProtocolScAddress, augmeaLendingProtocolMetadata, 'aleph-testnet');

  ///////////////////////////////////////////////////////////////////////////////
  ///  DATA SUBSCRIPTION  ///////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////
  const [augmeaLendingProtocolCalculateBorrowAmountDotAmountToUse, setAugmeaLendingProtocolCalculateBorrowAmountDotAmountToUse] = useState(0);
  const [augmeaLendingProtocolIsLiquidatedBorrowPositionId, setAugmeaLendingProtocolIsLiquidatedBorrowPositionId] = useState(0);
  const [augmeaLendingProtocolReadyToBeLiquidatedBorrowPositionId, setAugmeaLendingProtocolReadyToBeLiquidatedBorrowPositionId] = useState(0);
  
  let subscriptionAugmeaLendingProtocolActualAugmeaReserves = useCallSubscription<boolean>(augmeaLendingProtocolScInstance, 'getActualAugmeaReserves', []);
  let subscriptionAugmeaLendingProtocolCalculateBorrowAmount = useCallSubscription<boolean>(augmeaLendingProtocolScInstance, 'calculateBorrowAmountApproximately', [augmeaLendingProtocolCalculateBorrowAmountDotAmountToUse]);
  let subscriptionAugmeaLendingProtocolIsLiquidated = useCallSubscription<boolean>(augmeaLendingProtocolScInstance, 'isLiquidated', [augmeaLendingProtocolIsLiquidatedBorrowPositionId]);
  let subscriptionAugmeaLendingProtocolReadyToBeLiquidated = useCallSubscription<boolean>(augmeaLendingProtocolScInstance, 'readyToBeLiquidated', [augmeaLendingProtocolReadyToBeLiquidatedBorrowPositionId]);

  ///////////////////////////////////////////////////////////////////////////////
  ///  TX CALLS  ////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////
  const [augmeaLendingProtocolDepositTxAmountToDepositParam, setAugmeaLendingProtocolDepositTxAmountToDepositParam] = useState(0);
  const [augmeaLendingProtocolRedeemTxAmountToRedeemParam, setAugmeaLendingProtocolRedeemTxAmountToRedeemParam] = useState(0);
  const [augmeaLendingProtocolBorrowTxAmountDotCollateralParam, setAugmeaLendingProtocolBorrowTxAmountDotCollateralParam] = useState(0);
  const [augmeaLendingProtocolRepayTxPositionIdToRepayParam, setAugmeaLendingProtocolRepayTxPositionIdToRepayParam] = useState(0);
  const [augmeaLendingProtocolRepayTxAmountToRepayParam, setAugmeaLendingProtocolRepayTxAmountToRepayParam] = useState(0);
  const [augmeaLendingProtocolLiquidateTxPositionIdParam, setAugmeaLendingProtocolLiquidateTxPositionIdParam] = useState(0);

  const augmeaLendingProtocolTxCallDeposit = useTx(augmeaLendingProtocolScInstance, 'deposit');
  const augmeaLendingProtocolTxCallRedeem = useTx(augmeaLendingProtocolScInstance, 'redeem');
  const augmeaLendingProtocolTxCallBorrow = useTx(augmeaLendingProtocolScInstance, 'borrow');
  const augmeaLendingProtocolTxCallRepay = useTx(augmeaLendingProtocolScInstance, 'repay');
  const augmeaLendingProtocolTxCallLiquidate = useTx(augmeaLendingProtocolScInstance, 'liquidate');
  useTxNotifications(augmeaLendingProtocolTxCallDeposit);
  useTxNotifications(augmeaLendingProtocolTxCallRedeem);
  useTxNotifications(augmeaLendingProtocolTxCallBorrow);
  useTxNotifications(augmeaLendingProtocolTxCallRepay);
  useTxNotifications(augmeaLendingProtocolTxCallLiquidate);


  const frameStyle = {
    backgroundColor: 'black',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  };
  
  const overlapGroupWrapperStyle = {
    backgroundColor: '#ffffff',
    height: '207px',
    width: '314px',
  };
  
  const overlapGroupStyle = {
    backgroundColor: '#000000',
    height: '205px',
    position: 'relative',
  };
  
  const overlapStyle = {
    height: '178px',
    left: '13px',
    position: 'absolute',
    top: '5px',
    width: '301px',
  };
  
  const rectangleStyle = {
    backgroundColor: '#97063a',
    border: '1px solid',
    borderColor: '#ffffff',
    borderRadius: '7px',
    height: '125px',
    left: '0',
    position: 'absolute',
    top: '53px',
    width: '287px',
  };
  
  const divStyle = {
    backgroundColor: '#97063a',
    border: '1px solid',
    borderColor: '#ffffff',
    borderRadius: '5px',
    height: '9px',
    left: '6px',
    position: 'absolute',
    top: '60px',
    width: '182px',
  };
  
  const rectangle2Style = {
    backgroundColor: '#97063a',
    border: '1px solid',
    borderColor: '#000000',
    borderRadius: '5px',
    height: '18px',
    left: '240px',
    position: 'absolute',
    top: '111px',
    width: '43px',
  };
  
  const rectangle3Style = {
    backgroundColor: '#97063a',
    border: '1px solid',
    borderColor: '#000000',
    borderRadius: '5px',
    height: '18px',
    left: '240px',
    position: 'absolute',
    top: '143px',
    width: '43px',
  };
  
  const rectangle4Style = {
    backgroundColor: '#97063a',
    border: '1px solid',
    borderColor: '#000000',
    borderRadius: '5px',
    height: '12px',
    left: '240px',
    position: 'absolute',
    top: '130px',
    width: '43px',
  };
  
  const rectangle5Style = {
    backgroundColor: '#97063a',
    border: '1px solid',
    borderColor: '#ffffff',
    borderRadius: '5px',
    height: '9px',
    left: '6px',
    position: 'absolute',
    top: '71px',
    width: '182px',
  };
  
  const rectangle6Style = {
    backgroundColor: '#97063a',
    border: '1px solid',
    borderColor: '#ffffff',
    borderRadius: '5px',
    height: '9px',
    left: '6px',
    position: 'absolute',
    top: '82px',
    width: '182px',
  };
  
  const rectangle7Style = {
    backgroundColor: '#97063a',
    border: '1px solid',
    borderColor: '#ffffff',
    borderRadius: '5px',
    height: '9px',
    left: '6px',
    position: 'absolute',
    top: '93px',
    width: '182px',
  };
  
  const rectangle8Style = {
    backgroundColor: '#97063a',
    border: '1px solid',
    borderColor: '#ffffff',
    borderRadius: '5px',
    height: '9px',
    left: '6px',
    position: 'absolute',
    top: '104px',
    width: '182px',
  };
  
  const imgStyle = {
    height: '10px',
    left: '197px',
    position: 'absolute',
    top: '58px',
    width: '24px',
  };
  
  const rectangle9Style = {
    backgroundColor: '#97063a',
    border: '1px solid',
    borderColor: '#ffffff',
    borderRadius: '5px',
    height: '10px',
    left: '197px',
    position: 'absolute',
    top: '70px',
    width: '24px',
  };
  
  const rectangle10Style = {
    backgroundColor: '#97063a',
    border: '1px solid',
    borderColor: '#ffffff',
    borderRadius: '5px',
    height: '10px',
    left: '197px',
    position: 'absolute',
    top: '81px',
    width: '24px',
  };
  
  const rectangle11Style = {
    backgroundColor: '#97063a',
    border: '1px solid',
    borderColor: '#ffffff',
    borderRadius: '5px',
    height: '10px',
    left: '197px',
    position: 'absolute',
    top: '93px',
    width: '24px',
  };
  
  const rectangle12Style = {
    backgroundColor: '#97063a',
    border: '1px solid',
    borderColor: '#ffffff',
    borderRadius: '5px',
    height: '10px',
    left: '197px',
    position: 'absolute',
    top: '104px',
    width: '24px',
  };
  
  const textWrapperStyle = {
    color: '#ffffff',
    fontFamily: '"Content", Helvetica',
    fontSize: '5px',
    fontWeight: '400',
    left: '11px',
    letterSpacing: '0',
    lineHeight: 'normal',
    position: 'absolute',
    top: '59px',
  };
  
  const textWrapper2Style = {
    color: '#ffffff',
    fontFamily: '"Content", Helvetica',
    fontSize: '5px',
    fontWeight: '400',
    left: '10px',
    letterSpacing: '0',
    lineHeight: 'normal',
    position: 'absolute',
    top: '70px',
  };
  
  const textWrapper3Style = {
    color: '#ffffff',
    fontFamily: '"Content", Helvetica',
    fontSize: '5px',
    fontWeight: '400',
    left: '10px',
    letterSpacing: '0',
    lineHeight: 'normal',
    position: 'absolute',
    top: '81px',
  };
  
  const textWrapper4Style = {
    color: '#ffffff',
    fontFamily: '"Content", Helvetica',
    fontSize: '5px',
    fontWeight: '400',
    left: '9px',
    letterSpacing: '0',
    lineHeight: 'normal',
    position: 'absolute',
    top: '92px',
  };
  
  const textWrapper5Style = {
    color: '#ffffff',
    fontFamily: '"Content", Helvetica',
    fontSize: '5px',
    fontWeight: '400',
    left: '9px',
    letterSpacing: '0',
    lineHeight: 'normal',
    position: 'absolute',
    top: '103px',
  };
  
  const textWrapper6Style = {
    color: '#ffffff',
    fontFamily: '"Content", Helvetica',
    fontSize: '5px',
    fontWeight: '400',
    left: '198px',
    letterSpacing: '0',
    lineHeight: 'normal',
    position: 'absolute',
    top: '58px',
    width: '29px',
  };
  
  const textWrapper7Style = {
    color: '#000000',
    fontFamily: '"Content", Helvetica',
    fontSize: '4px',
    fontWeight: '400',
    left: '240px',
    letterSpacing: '0',
    lineHeight: 'normal',
    position: 'absolute',
    textAlign: 'center',
    top: '113px',
    width: '43px',
  };
  
  const textWrapper8Style = {
    color: '#000000',
    fontFamily: '"Content", Helvetica',
    fontSize: '3.8px',
    fontWeight: '400',
    left: '240px',
    letterSpacing: '0',
    lineHeight: 'normal',
    position: 'absolute',
    textAlign: 'center',
    top: '131px',
    width: '43px',
  };
  
  const pStyle = {
    color: '#000000',
    fontFamily: '"Content", Helvetica',
    fontSize: '3.8px',
    fontWeight: '400',
    left: '240px',
    letterSpacing: '0',
    lineHeight: 'normal',
    position: 'absolute',
    textAlign: 'center',
    top: '145px',
    width: '43px',
  };
  
  const textWrapper9Style = {
    color: '#ffffff',
    fontFamily: '"Content", Helvetica',
    fontSize: '5px',
    fontWeight: '400',
    left: '199px',
    letterSpacing: '0',
    lineHeight: 'normal',
    position: 'absolute',
    top: '70px',
  };
  
  const textWrapper10Style = {
    color: '#ffffff',
    fontFamily: '"Content", Helvetica',
    fontSize: '5px',
    fontWeight: '400',
    left: '198px',
    letterSpacing: '0',
    lineHeight: 'normal',
    position: 'absolute',
    top: '81px',
  };
  
  const textWrapper11Style = {
    color: '#ffffff',
    fontFamily: '"Content", Helvetica',
    fontSize: '5px',
    fontWeight: '400',
    left: '201px',
    letterSpacing: '0',
    lineHeight: 'normal',
    position: 'absolute',
    top: '93px',
  };
  
  const textWrapper12Style = {
    color: '#ffffff',
    fontFamily: '"Content", Helvetica',
    fontSize: '4px',
    fontWeight: '400',
    left: '199px',
    letterSpacing: '0',
    lineHeight: 'normal',
    position: 'absolute',
    top: '104px',
  };
  
  const rectangle13Style = {
    backgroundColor: '#97063a',
    border: '1px solid',
    borderColor: '#000000',
    borderRadius: '5px',
    height: '10px',
    left: '53px',
    position: 'absolute',
    top: '119px',
    width: '182px',
  };
  
  const textWrapper13Style = {
    color: '#000000',
    fontFamily: '"Content", Helvetica',
    fontSize: '5px',
    fontWeight: '400',
    left: '56px',
    letterSpacing: '0',
    lineHeight: 'normal',
    position: 'absolute',
    top: '119px',
  };
  
  const rectangle14Style = {
    backgroundColor: '#97063a',
    border: '1px solid',
    borderColor: '#000000',
    borderRadius: '5px',
    height: '10px',
    left: '53px',
    position: 'absolute',
    top: '132px',
    width: '182px',
  };
  
  const rectangle15Style = {
    backgroundColor: '#97063a',
    border: '1px solid',
    borderColor: '#000000',
    borderRadius: '5px',
    height: '10px',
    left: '54px',
    position: 'absolute',
    top: '144px',
    width: '182px',
  };
  
  const rectangle16Style = {
    backgroundColor: '#97063a',
    border: '1px solid',
    borderColor: '#000000',
    borderRadius: '5px',
    height: '10px',
    left: '55px',
    position: 'absolute',
    top: '163px',
    width: '215px',
  };
  
  const textWrapper14Style = {
    color: '#000000',
    fontFamily: '"Content", Helvetica',
    fontSize: '5px',
    fontWeight: '400',
    left: '57px',
    letterSpacing: '0',
    lineHeight: 'normal',
    position: 'absolute',
    top: '132px',
  };
  
  const textWrapper15Style = {
    color: '#000000',
    fontFamily: '"Content", Helvetica',
    fontSize: '5px',
    fontWeight: '400',
    left: '57px',
    letterSpacing: '0',
    lineHeight: 'normal',
    position: 'absolute',
    top: '144px',
  };
  
  const textWrapper16Style = {
    color: '#000000',
    fontFamily: '"Content", Helvetica',
    fontSize: '5px',
    fontWeight: '400',
    left: '58px',
    letterSpacing: '0',
    lineHeight: 'normal',
    position: 'absolute',
    top: '163px',
  };
  
  const vectorStyle = {
    height: '55px',
    left: '87px',
    position: 'absolute',
    top: '0',
    width: '214px',
  };
  
  const lendBorrowStyle = {
    color: '#ffffff',
    fontFamily: '"Content", Helvetica',
    fontSize: '8.5px',
    fontWeight: '400',
    left: '180px',
    letterSpacing: '0',
    lineHeight: 'normal',
    position: 'absolute',
    top: '11px',
  };
  
  const layerStyle = {
    height: '32px',
    left: '18px',
    position: 'absolute',
    top: '18px',
    width: '32px',
  };
  
  const imageStyle = {
    height: '11px',
    left: '0',
    objectFit: 'cover',
    position: 'absolute',
    top: '0',
    width: '29px',
  };

  function displayFunc()
  {
    alert("helloWorld!");
  }

  function calculate()
  {
    let dotQuantity = augmeaLendingProtocolCalculateBorrowAmountDotAmountToUse;
    let augmeaStablecoin = pickDecoded(subscriptionAugmeaLendingProtocolActualAugmeaReserves.result)?.toString();

    alert(dotQuantity + " dot => " + augmeaStablecoin + " augmeaStablecoin borrowValue");
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
              <div style={overlapGroupWrapperStyle}>
                <div style={overlapGroupStyle}>
                  <div style={overlapStyle}>
                    <div style={rectangleStyle} />
                    <div style={divStyle}/>
                    <div style={rectangle2Style}/>
                    <div style={rectangle3Style} />
                    <div style={rectangle4Style} />
                    <div style={rectangle5Style} />
                    <div style={rectangle6Style} />
                    <div style={rectangle7Style} />
                    <div style={rectangle8Style} />
                    <img style={imgStyle} alt="Rectangle" src="/img/rectangle-51.svg" />
                    <div style={rectangle9Style} />
                    <div style={rectangle10Style} />
                    <div style={rectangle11Style} />
            

                    <div style={textWrapperStyle}>
                      augmeaStablecoinToUse:

                      <div style={{paddingLeft: '3.6rem', position: 'relative', top: '-3.5px'}}>
                        <input type="number" onChange={e => setAugmeaLendingProtocolDepositTxAmountToDepositParam(e.target.value)} style={{height: '6px', width: '115px', backgroundColor: '#97063a', border: 'none', fontSize: '6px'}}></input>
                      </div>
                    </div>

                    <div style={textWrapper2Style}>
                      amountToRedeem:

                      <div style={{paddingLeft: '2.7rem', position: 'relative', top: '-3.5px'}}>
                        <input type="number" onChange={e => setAugmeaLendingProtocolRedeemTxAmountToRedeemParam(e.target.value)} style={{height: '6px', width: '130.5px', backgroundColor: '#97063a', border: 'none', fontSize: '6px'}}></input>
                      </div>
                    </div>

                    <div style={textWrapper3Style}>
                      dotCollateralAmountToUse:

                      <div style={{paddingLeft: '3.85rem', position: 'relative', top: '-3.5px'}}>
                        <input type="number" onChange={e => setAugmeaLendingProtocolBorrowTxAmountDotCollateralParam(e.target.value)} style={{height: '6px', width: '112px', backgroundColor: '#97063a', border: 'none', fontSize: '6px'}}></input>
                      </div>
                    </div>

                    <div style={textWrapper4Style}>
                      amountAugmeaStablecoinToRepay:

                      <div style={{paddingLeft: '5.02rem', position: 'relative', top: '-3.5px'}}>
                        <input type="number" onChange={e => setAugmeaLendingProtocolRepayTxAmountToRepayParam(e.target.value)} style={{height: '6px', width: '94px', backgroundColor: '#97063a', border: 'none', fontSize: '6px'}}></input>
                      </div>
                    </div>

                    <div style={textWrapper5Style}>
                      borrowPositionId:

                      <div style={{paddingLeft: '2.47rem', position: 'relative', top: '-3.5px'}}>
                        <input type="number" onChange={e => setAugmeaLendingProtocolRepayTxPositionIdToRepayParam(e.target.value)} style={{height: '6px', width: '135px', backgroundColor: '#97063a', border: 'none', fontSize: '6px'}}></input>
                      </div>
                    </div>

                    <div style={textWrapper5Style}>borrowPositionId:</div>

                    <div style={textWrapper6Style}>
                      <button onClick={() => augmeaLendingProtocolTxCallDeposit.signAndSend([augmeaLendingProtocolDepositTxAmountToDepositParam])}>
                        {shouldDisable(augmeaLendingProtocolTxCallDeposit) ? 'SETTING' : 'DEPOSIT'}
                      </button>
                    </div>

                    <div style={textWrapper7Style}>
                      <button onClick={calculate}>CHECK BORROW AMOUNT</button>
                    </div>

                    <div style={textWrapper8Style}>
                      <button onClick={displayFunc}>CHECK IS LIQUIDATED</button>
                    </div>

                    <p style={pStyle}>
                      <button onClick={displayFunc}>CHECK IS READY TO BE LIQUIDATED</button>
                    </p>

                    <div style={textWrapper9Style}>
                      <button onClick={() => augmeaLendingProtocolTxCallRedeem.signAndSend([augmeaLendingProtocolRedeemTxAmountToRedeemParam])}>
                        {shouldDisable(augmeaLendingProtocolTxCallRedeem) ? 'SETTING' : 'REDEEM'}
                      </button>
                    </div>

                    <div style={textWrapper10Style}>
                      <button onClick={() => augmeaLendingProtocolTxCallBorrow.signAndSend([augmeaLendingProtocolBorrowTxAmountDotCollateralParam])}>
                        {shouldDisable(augmeaLendingProtocolTxCallBorrow) ? 'SETTING' : 'BORROW'}
                      </button>
                    </div>

                    <div style={textWrapper11Style}>
                      <button onClick={() => augmeaLendingProtocolTxCallRepay.signAndSend([augmeaLendingProtocolRepayTxPositionIdToRepayParam, augmeaLendingProtocolRepayTxAmountToRepayParam])}>
                        {shouldDisable(augmeaLendingProtocolTxCallRepay) ? 'SETTING' : 'REPAY'}
                      </button>
                    </div>

                    <div style={rectangle13Style} />

                    <div style={textWrapper13Style}>
                      dotAmountToUse:

                      <div style={{paddingBottom: '', paddingLeft: '2.55rem', position: 'relative', top: '-4px'}}>
                        <input onChange={e => setAugmeaLendingProtocolCalculateBorrowAmountDotAmountToUse(e.target.value)} style={{height: '6px', width: '134px', backgroundColor: '#97063a', border: 'none', fontSize: '7px'}}></input>
                      </div>
                    </div>

                    <div style={rectangle14Style} />
                    <div style={rectangle15Style} />
                    <div style={rectangle16Style} />

                    <div style={textWrapper14Style}>
                      borrowPositionId:

                      <div style={{paddingLeft: '2.5rem', position: 'relative', top: '-3.9px'}}>
                        <input style={{height: '6px', width: '134px', backgroundColor: '#97063a', border: 'none', fontSize: '7px'}}></input>
                      </div>
                    </div>

                    <div style={textWrapper15Style}>
                      borrowPositionId:

                      <div style={{paddingLeft: '2.5rem', position: 'relative', top: '-3.9px'}}>
                        <input style={{height: '6px', width: '134px', backgroundColor: '#97063a', border: 'none', fontSize: '7px'}}></input>
                      </div>
                    </div>

                    <div style={textWrapper16Style}>augmeaLiquidityReserve: {pickDecoded(subscriptionAugmeaLendingProtocolActualAugmeaReserves.result)?.toString() || '--'}</div>
                    <img style={vectorStyle} alt="Vector" src="/img/vector.png" />
                    <div style={lendBorrowStyle}>“Lend &amp; Borrow”</div>
                  </div>
                  <Link to="/">
                    <img className="layer" alt="Layer" src="/img/layer-5.png" />
                  </Link>
                  <img className="image" alt="Image" src="/img/image-7.png" />
                </div>
              </div>
            </div>
          </>
        )
      }
    </div>
  );
};

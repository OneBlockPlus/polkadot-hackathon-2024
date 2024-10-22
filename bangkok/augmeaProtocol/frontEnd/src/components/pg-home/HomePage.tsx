/* eslint-disable @next/next/no-img-element */
import {useBalance, useBlockHeader, useBlockHeaders, useCall, useCallSubscription, useChainRpc, useChainRpcList, useContract, useDryRun, useEventSubscription, useEvents, useInstalledWallets, useTx, useTxPaymentInfo, useUninstalledWallets, useWallet,} from 'useink';
import { RustResult, formatBalance, isBroadcast, isFinalized, isInBlock, isPendingSignature, pickDecoded, pickDecodedError, pickResultErr, pickResultOk, pickTxInfo, shouldDisable,} from 'useink/utils';
import { ChainId } from 'useink/chains';
import { useEffect, useMemo, useState } from 'react';
import { useNotifications, useTxNotifications } from 'useink/notifications';
import { Notifications } from '../Notifications';


import liquidStakingTokenCallWrapperMetadata from '../../metadata/liquid_staking_call_wrapper.json';
import augmeaStablecoinMetadata from '../../metadata/augmea_stablecoin.json';
import liquidStablecoinVaultMetadata from '../../metadata/liquid_stablecoin_vault.json';
import augmeaLendingProtocolMetadata from '../../metadata/augmea_lending_protocol.json';


import { Routes, Route } from "react-router-dom";

import { FrameOne } from './FramesComponents/Frame1/FrameOne';
import { FrameThree } from './FramesComponents/Frame3/FrameThree'
import { FrameFour } from './FramesComponents/Frame4/FrameFour';



export const HomePage: React.FC = () => 
{
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
  ///  LIQUID STAKING CONTRACT  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  ///////////////////////////////////////////////////////////////////////////////
  ///  SETUP  ///////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////
  const liquidStakingTokenCallWrapperScAddress = '5FFaySnQQNC2rJjGiK3UYsXDpdxLvZaz18VqUZSUMtuH22rb';
  const liquidStakingTokenCallWrapperScInstance = useContract(liquidStakingTokenCallWrapperScAddress, liquidStakingTokenCallWrapperMetadata, 'aleph-testnet');

  ///////////////////////////////////////////////////////////////////////////////
  ///  DATA SUBSCRIPTION  ///////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////
  const [liquidStakingAddressToCheckBalance, setLiquidStakingAddressToCheckBalance] = useState('5CouKM5da5pNvR7azG3QuHhhBK3vLrr2uY9YWdsLqsFmgQ8n');
  const [liquidStakingAllowanceOwnerToCheck, setLiquidStakingAllowanceOwnerToCheck] = useState('5CouKM5da5pNvR7azG3QuHhhBK3vLrr2uY9YWdsLqsFmgQ8n');
  const [liquidStakingAllowanceSpenderToCheck, setLiquidStakingAllowanceSpenderToCheck] = useState('');

  let subscriptionLiquidStakingUserBalance = useCallSubscription<boolean>(liquidStakingTokenCallWrapperScInstance, 'checkBalanceOf', [liquidStakingAddressToCheckBalance]);
  let subscriptionLiquidStakingAllowance = useCallSubscription<boolean>(liquidStakingTokenCallWrapperScInstance, 'checkAllowance', [liquidStakingAllowanceOwnerToCheck, liquidStakingAllowanceSpenderToCheck]);

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
  const [augmeaStablecoinAddressToCheckBalance, setAugmeaStablecoinAddressToCheckBalance] = useState('5CGTtBZzToV2YzMJSkfVfdL24SPtVrUcJCX1fgHLjX2a9mxa');
  const [augmeaStablecoinAllowanceOwnerToCheck, setAugmeaStablecoinAllowanceOwnerToCheck] = useState('5CouKM5da5pNvR7azG3QuHhhBK3vLrr2uY9YWdsLqsFmgQ8n');
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






  return (
    <div style={{backgroundColor: 'black'}}>
      <section>
        <Notifications />

        <Routes>
          <Route path="/" element={ <FrameOne/> } />
          <Route path="FrameThree" element={ <FrameThree/> } />
          <Route path="FrameFour" element={ <FrameFour/> } />
        </Routes>
      </section>
    </div>
  );


};










// return (
//   <section>
//     <Notifications />


//     <div style={{paddingLeft: '60px', paddingTop: '60px', backgroundColor: 'black'}}>
//       <div>
//         <h2>
//           aZerotestnetActualBlock:  {aZeroTestnetBlockNumber?.blockNumber === undefined ? '--' : aZeroTestnetBlockNumber.blockNumber.toLocaleString()}
//         </h2>

//         <div style={{paddingTop: '1rem'}}>
//           <h1>WALLET:</h1>

//           {
//             !account &&
//             (
//               <ul className="flex flex-col gap-4">
//               {
//                 installedWallets.length > 0 ?
//                 (
//                   <>
//                     <h2 className="text-xl font-bold">Connect a Wallet</h2>
//                     <h3 className="text-md">Installed Wallets</h3>

//                     {
//                       installedWallets.map
//                       (
//                         (w) => 
//                         (
//                           <li key={w.title}>
//                             <button
//                               onClick={() => connect(w.extensionName)}
//                               className="flex items-center w-full rounded-2xl text-white px-6 py-4 bg-blue-500 hover:bg-blue-600 transition duration-75"
//                             >
//                               <img className="w-12 mr-2" src={w.logo.src} alt={w.logo.alt} />
                                    
                                    
//                               Connect to {w.title}
//                             </button>
//                           </li>
//                         )
//                       )
//                     }
//                   </>
//                 )
//                 :
//                 (
//                   <h2 className="text-xl font-bold">You don&apos;t have any wallets installed...</h2> 
//                 )
//               }
//               </ul>
//             )
//           }

//           {
//             account && 
//             (
//               <>
//                 {/*///  DISCONNECT BUTTON  ///////////////////////////////////////////////////////*/}
//                 <li>
//                   <button
//                     onClick={disconnect}
//                     className="rounded-2xl text-white px-6 py-4 bg-blue-500 hover:bg-blue-600 transition duration-75"
//                   >
//                     Disconnect
//                   </button>
//                 </li>

//                 {/*///  CONNECTED WALLET DATA ////////////////////////////////////////////////////*/}
//                 <li>
//                   <b>You are connected as:</b>


//                   <span className="ml-4 dark:bg-slate-600 bg-slate-200 rounded-lg py-2 px-2">
//                     {/* {account?.name || account?.address} */}
//                     <div>
//                       {account.name}  
//                     </div>
//                     <div>
//                       {account.address}
//                     </div>
//                   </span>
//                 </li>

//                 {
//                   accounts?.map
//                   (
//                     (acc) => account !== acc && 
//                     (
//                         <li key={acc.address} className="flex flex-col">

//                           <b>Connect to {acc.name ? acc.name : 'wallet'}</b>


//                           <button
//                             onClick={() => setAccount(acc)}
//                             className="rounded-2xl text-white px-4 py-2 mt-2 bg-blue-500 hover:bg-blue-600 transition duration-75"
//                           >
//                             {acc.address}
//                           </button>

//                         </li>
//                     ),
//                   )
//                 }

//                 <li>
//                   <b>Your Free Balance:</b>

//                   <span className="ml-4 dark:bg-slate-600 bg-slate-200 rounded-lg py-2 px-2">
//                     {formatBalance(balance?.freeBalance, { decimals: 12, withSi: true })}
//                   </span>
//                 </li>
//               </>
//             )
//           }
//         </div>
//       </div>


//       <div style={{paddingTop: '6rem'}}>
//         <div>
//           <h1>liquidStaking</h1>


//           <h2 style={{paddingTop: '2rem'}}> 
//             liquidStakingTokenBalance: {pickDecoded(subscriptionLiquidStakingUserBalance.result)?.toString() || '--'}
//           </h2>


//           <div style={{display: 'flex', paddingTop: '1rem'}}>
//             <h2>addressToCheckAllowance:</h2>
//             <input type="text" style={{color: 'black'}} onChange={e => setLiquidStakingAllowanceSpenderToCheck(e.target.value)}></input>
//           </div>

          
//           <h2>
//             allowance: {pickDecoded(subscriptionLiquidStakingAllowance.result)?.toString() || '--'}
//           </h2>
//         </div>


//         <div style={{paddingTop: '6rem'}}>
//           <h1>augmeaStablecoin</h1>


//           <h2 style={{paddingTop: '2rem'}}> 
//             augmeaStablecoinBalance: {pickDecoded(subscriptionAugmeaStablecoinUserBalance.result)?.toString() || '--'}
//           </h2>


//           <div style={{display: 'flex', paddingTop: '1rem'}}>
//             <h2>addressToCheckAllowance:</h2>
//             <input type="text" style={{color: 'black'}} onChange={e => setAugmeaStablecoinAllowanceSpenderToCheck(e.target.value)}></input>
//           </div>


//           <h2>
//             allowance: {pickDecoded(subscriptionAugmeaStablecoinAllowance.result)?.toString() || '--'}
//           </h2>


//           <div style={{paddingTop: '1rem'}}>
//             <h2>Transfer:</h2>


//             <div style={{display: 'flex'}}>
//               <h2>addressToTransfer:</h2>
//               <input type="text" style={{color: 'black'}} onChange={e => setAugmeaStablecoinTransferTxAddressToTransferParam(e.target.value)}></input>
//             </div>


//             <div style={{display: 'flex'}}>
//               <h2>quantityToTransfer:</h2>
//               <input type="number" style={{color: 'black'}} onChange={e => setAugmeaStablecoinTransferTxQuantityToTransferParam(e.target.value)}></input>
//             </div>


//             <button onClick={() => augmeaStablecoinTxCallTransfer.signAndSend([augmeaStablecoinTransferTxQuantityToTransferParam, augmeaStablecoinTransferTxAddressToTransferParam])} style={{paddingTop: '0.13rem', backgroundColor: 'gray'}}>
//               {shouldDisable(augmeaStablecoinTxCallTransfer) ? 'SETTING' : 'transfer'}
//             </button>
//           </div>


//           <div style={{paddingTop: '1rem'}}>
//             <h2>setAllowance:</h2>


//             <div style={{display: 'flex'}}>
//               <h2>spenderAddressToPermit:</h2>
//               <input type="text" style={{color: 'black'}} onChange={e => setAugmeaStablecoinAllowanceTxAddressToPermitParam(e.target.value)}></input>
//             </div>


//             <div style={{display: 'flex'}}>
//               <h2>quantityToPermit:</h2>
//               <input type="number" style={{color: 'black'}} onChange={e => setAugmeaStablecoinAllowanceTxQuantityToPermitParam(e.target.value)}></input>
//             </div>


//             <button onClick={() => augmeaStablecoinTxCallSetAllowance.signAndSend([augmeaStablecoinAllowanceTxQuantityToPermitParam, augmeaStablecoinAllowanceTxAddressToPermitParam])} style={{paddingTop: '0.13rem', backgroundColor: 'gray'}}>
//               {shouldDisable(augmeaStablecoinTxCallSetAllowance) ? 'SETTING' : 'set'}
//             </button>
//             {/* <button style={{backgroundColor: 'gray'}}>set</button> */}
//           </div>
//         </div>


//         <div style={{paddingTop: '6rem'}}>
//           <div>
//             <h1>liquidStablecoinVault</h1>


//             <div style={{paddingTop: '1rem'}}>
//               <h2>mintStablecoin:</h2>


//               <div style={{display: 'flex'}}>
//                 <h2>quantityLiquidAssetToUseToMint:</h2>
//                 <input type="number" style={{color: 'black'}} onChange={e => setLiquidStablecoinVaultMintStablecoinTxLiquidAssetToUseParam(e.target.value)}></input>
//               </div>


//               <button onClick={() => liquidStablecoinVaultTxCallMintStablecoin.signAndSend([liquidStablecoinVaultMintStablecoinTxLiquidAssetToUseParam])} style={{paddingTop: '0.13rem', backgroundColor: 'gray'}}>
//                 {shouldDisable(liquidStablecoinVaultTxCallMintStablecoin) ? 'SETTING' : 'mint'}
//               </button>
//             </div>
//           </div>
//         </div>


//         <div style={{paddingTop: '6rem'}}>
//           <h1>augmeaLendingProtocol</h1>


//           <h2 style={{paddingTop: '2rem'}}> 
//             protocolActualAugmeaReserves: {pickDecoded(subscriptionAugmeaLendingProtocolActualAugmeaReserves.result)?.toString() || '--'}
//           </h2>


//           <div style={{display: 'flex', paddingTop: '1rem'}}>
//             <h2>dotAmountToUseToBorrow:</h2>
//             <input type="text" style={{color: 'black'}} onChange={e => setAugmeaLendingProtocolCalculateBorrowAmountDotAmountToUse(e.target.value)}></input>
//           </div>


//           <h2>
//             borrowAmount: {pickDecoded(subscriptionAugmeaLendingProtocolCalculateBorrowAmount.result)?.toString() || '--'}
//           </h2>


//           <div style={{display: 'flex', paddingTop: '1rem'}}>
//             <h2>positionIdToCheck:</h2>
//             <input type="text" style={{color: 'black'}} onChange={e => setAugmeaLendingProtocolIsLiquidatedBorrowPositionId(e.target.value)}></input>
//           </div>


//           <h2>
//             isLiquidated: {pickDecoded(subscriptionAugmeaLendingProtocolIsLiquidated.result)?.toString() || '--'}
//           </h2>


//           <div style={{display: 'flex', paddingTop: '1rem'}}>
//             <h2>positionIdToCheck:</h2>
//             <input type="text" style={{color: 'black'}} onChange={e => setAugmeaLendingProtocolReadyToBeLiquidatedBorrowPositionId(e.target.value)}></input>
//           </div>


//           <h2>
//             readyToBeLiquidated: {pickDecoded(subscriptionAugmeaLendingProtocolReadyToBeLiquidated.result)?.toString() || '--'}
//           </h2>


//           <div style={{paddingTop: '1rem'}}>
//             <h2>Deposit:</h2>


//             <div style={{display: 'flex'}}>
//               <h2>amountToDeposit:</h2>
//               <input type="number" style={{color: 'black'}} onChange={e => setAugmeaLendingProtocolDepositTxAmountToDepositParam(e.target.value)}></input>
//             </div>


//             <button onClick={() => augmeaLendingProtocolTxCallDeposit.signAndSend([augmeaLendingProtocolDepositTxAmountToDepositParam])} style={{paddingTop: '0.13rem', backgroundColor: 'gray'}}>
//               {shouldDisable(augmeaLendingProtocolTxCallDeposit) ? 'SETTING' : 'deposit'}
//             </button>
//           </div>


//           <div style={{paddingTop: '1rem'}}>
//             <h2>Redeem:</h2>


//             <div style={{display: 'flex'}}>
//               <h2>amountToRedeem:</h2>
//               <input type="number" style={{color: 'black'}} onChange={e => setAugmeaLendingProtocolRedeemTxAmountToRedeemParam(e.target.value)}></input>
//             </div>


//             <button onClick={() => augmeaLendingProtocolTxCallRedeem.signAndSend([augmeaLendingProtocolRedeemTxAmountToRedeemParam])} style={{paddingTop: '0.13rem', backgroundColor: 'gray'}}>
//               {shouldDisable(augmeaLendingProtocolTxCallRedeem) ? 'SETTING' : 'redeem'}
//             </button>
//           </div>


//           <div style={{paddingTop: '1rem'}}>
//             <h2>Borrow:</h2>


//             <div style={{display: 'flex'}}>
//               <h2>amountDotCollateralToUse:</h2>
//               <input type="number" style={{color: 'black'}} onChange={e => setAugmeaLendingProtocolBorrowTxAmountDotCollateralParam(e.target.value)}></input>
//             </div>


//             <button onClick={() => augmeaLendingProtocolTxCallBorrow.signAndSend([augmeaLendingProtocolBorrowTxAmountDotCollateralParam])} style={{paddingTop: '0.13rem', backgroundColor: 'gray'}}>
//               {shouldDisable(augmeaLendingProtocolTxCallBorrow) ? 'SETTING' : 'borrow'}
//             </button>
//           </div>


//           <div style={{paddingTop: '1rem'}}>
//             <h2>Repay:</h2>


//             <div style={{display: 'flex'}}>
//               <h2>positionToRepayId:</h2>
//               <input type="number" style={{color: 'black'}} onChange={e => setAugmeaLendingProtocolRepayTxPositionIdToRepayParam(e.target.value)}></input>
//             </div>


//             <div style={{display: 'flex'}}>
//               <h2>amountToRepay:</h2>
//               <input type="number" style={{color: 'black'}} onChange={e => setAugmeaLendingProtocolRepayTxAmountToRepayParam(e.target.value)}></input>
//             </div>


//             <button onClick={() => augmeaLendingProtocolTxCallRepay.signAndSend([augmeaLendingProtocolRepayTxPositionIdToRepayParam, augmeaLendingProtocolRepayTxAmountToRepayParam])} style={{paddingTop: '0.13rem', backgroundColor: 'gray'}}>
//               {shouldDisable(augmeaLendingProtocolTxCallRepay) ? 'SETTING' : 'repay'}
//             </button>
//           </div>


//           <div style={{paddingTop: '1rem'}}>
//             <h2>Liquidate:</h2>


//             <div style={{display: 'flex'}}>
//               <h2>positionToLiquidateId:</h2>
//               <input type="number" style={{color: 'black'}} onChange={e => setAugmeaLendingProtocolLiquidateTxPositionIdParam(e.target.value)}></input>
//             </div>


//             <button onClick={() => augmeaLendingProtocolTxCallLiquidate.signAndSend([augmeaLendingProtocolLiquidateTxPositionIdParam])} style={{paddingTop: '0.13rem', backgroundColor: 'gray'}}>
//               {shouldDisable(augmeaLendingProtocolTxCallLiquidate) ? 'SETTING' : 'liquidate'}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   </section>
// );
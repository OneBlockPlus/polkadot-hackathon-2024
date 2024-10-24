import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import {createBrowserRouter,RouterProvider,createRoutesFromElements} from 'react-router-dom'
import { Route } from 'react-router-dom'
import Home from './components/Home.jsx'
import Navbar from './components/Navbar.jsx'
import PolkadotBalanceHistory from './components/Polkadot/Account/PolkadotBalanceHistory.jsx'
import PolkadotLayout from './components/Polkadot/Account/PolkadotLayout.jsx'
import PolkadotTokenHolder from './components/Polkadot/Account/PolkadotTokenHolder.jsx'
import PolkadotAccountList from './components/Polkadot/Account/PolkadotAccountList.jsx'
import PolkadotAccountStats from './components/Polkadot/Account/PolkadotAccountStats.jsx'
import PolkadotRewardSlashList from './components/Polkadot/Staking/PolkadotRewardSlashList.jsx'
import PolakdotValidatorList from './components/Polkadot/Staking/PolkadotValidatorList.jsx'
import PolkadotVotedValidator from './components/Polkadot/Staking/PolkadotVotedValidator.jsx'
import PolkadotContractEvents from './components/Polkadot/Contract/PolkadotContractEvents.jsx'
import PolkadotContractMeta from './components/Polkadot/Contract/PolkadotContractMeta.jsx'
import PolkadotBlockDetails from './components/Polkadot/Block/PolkadotBlockDetails.jsx'
import PolkadotBlockList from './components/Polkadot/Block/PolkadotBlockList.jsx'
import PolkadotNFTAccountBalance from './components/Polkadot/NFT/PolkadotNFTAccountBalance.jsx'
import PolkadotNFTHolders from './components/Polkadot/NFT/PolkadotNFTHolders.jsx'
import PolkadotNFTInfo from './components/Polkadot/NFT/PolkadotNFTInfo.jsx'

import KusamaAccountList from './components/Kusama/Account/KusamaAccountList.jsx'
import KusamaLayout from './components/Kusama/Account/KusamaLayout.jsx'
import KusamaTokenHolder from './components/Kusama/Account/KusamaTokenHolder.jsx'
import KusamaBalanceHistory from './components/Kusama/Account/KusamaBalanceHistory.jsx'
import KusamaBlockDetails from './components/Kusama/Block/KusamaBlockDetails.jsx'
import KusamaBlockList from './components/Kusama/Block/KusamaBlockList.jsx'
import KusamaRewardSlash from './components/Kusama/Staking/KusamaRewardSlashList.jsx'
import KusamaValidatorList from './components/Kusama/Staking/KusamaValidatorList.jsx'
import KusamaVotedValidator from './components/Kusama/Staking/KusamaVotedValidator.jsx'
import KusamaNFTHolders from './components/Kusama/NFT/KusamaNFTHolders.jsx'
import KusamaNFTInfo from './components/Kusama/NFT/KusamaNFTInfo.jsx'
import KusamaNFTAccountBalance from './components/Kusama/NFT/KusamaNFTAccountBalance.jsx'

import MoonbeamBalanceHistory from './components/Moonbeam/Account/MoonbeamBalanceHistory.jsx'
import MoonbeamTokenHolder from './components/Moonbeam/Account/MoonbeamTokenHolder.jsx'
import Moonbeamlayout from './components/Moonbeam/Account/MoonbeamLayout.jsx'
import MoonbeamAccountList from './components/Moonbeam/Account/MoonbeamAccountList.jsx'
import MoonbeamRewardSlash from './components/Moonbeam/Staking/MoonbeamRewardSlashList.jsx'
import MoonbeamVotedValidator from './components/Moonbeam/Staking/MoonbeamVotedValidator.jsx'
import MoonbeamValidatorList from './components/Moonbeam/Staking/MoonbeamValidatorList.jsx'
import MoonbeamBlockDetails from './components/Moonbeam/Block/MoonbeamBlockDetails.jsx'
import MoonbeamBlockList from './components/Moonbeam/Block/MoonbeamBlockList.jsx'
import MoonbeamNFTAccountBalance from './components/Moonbeam/NFT/MoonbeamNFTAccountBalance.jsx'
import MoonbeamNFTHolders from './components/Moonbeam/NFT/MoonbeamNFTHolders.jsx'
import MoonbeamNFTInfo from './components/Moonbeam/NFT/MoonbeamNFTInfo.jsx'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
    <Route path='/' element={<Home/>}/>
    <Route path='/polkadotbalancehistory' element={<PolkadotBalanceHistory/>}/>
    <Route path='/polkadotlayout' element={<PolkadotLayout/>}/>
    <Route path='/polkadottokenholder' element={<PolkadotTokenHolder/>}/>
    <Route path='/polkadotaccountlist' element={<PolkadotAccountList/>}/>
    <Route path='/polkadotaccountstats' element={<PolkadotAccountStats/>}/>
    <Route path='/polkadotrewardslash' element={<PolkadotRewardSlashList/>}/>
    <Route path='/polkadotvalidatorlist' element={<PolakdotValidatorList/>}/>
    <Route path='/polkadotvotedvalidaor' element={<PolkadotVotedValidator/>}/>
    <Route path='/polkadotcontractevents' element={<PolkadotContractEvents/>}/>
    <Route path='/polkadotcontractmeta' element={<PolkadotContractMeta/>}/>
    <Route path='/polkadotblockdetails' element={<PolkadotBlockDetails/>}/>
    <Route path='/polkadotblocklist' element={<PolkadotBlockList/>}/>
    <Route path='/polkadotnftaccountbalance' element={<PolkadotNFTAccountBalance/>}/>
    <Route path='/polkadotnftholders' element={<PolkadotNFTHolders/>}/>
    <Route path='/polkadotnftinfo' element={<PolkadotNFTInfo/>}/>
    <Route path='/kusamaaccountlist' element={<KusamaAccountList/>}/>
    <Route path='/kusamalayout' element={<KusamaLayout/>}/>
    <Route path='/kusamatokenholder' element={<KusamaTokenHolder/>}/>
    <Route path='/kusamabalancehistory' element={<KusamaBalanceHistory/>}/>
    <Route path='/kusamablocklist' element={<KusamaBlockList/>}/>
    <Route path='/kusamablockdetails' element={<KusamaBlockDetails/>}/>
    <Route path='/kusamarewardslash' element={<KusamaRewardSlash/>}/>
    <Route path='/kusamavotedvalidator' element={<KusamaVotedValidator/>}/>
    <Route path='/kusamavalidatorlist' element={<KusamaValidatorList/>}/>
    <Route path='/kusamanftinfo' element={<KusamaNFTInfo/>}/>
    <Route path='/kusamanftholders' element={<KusamaNFTHolders/>}/>
    <Route path='/kusamanftaccount' element={<KusamaNFTAccountBalance/>}/>
    <Route path='/moonbeamlayout' element={<Moonbeamlayout/>}/>
    <Route path='/moonbeamaccountlist' element={<MoonbeamAccountList/>}/>
    <Route path='/moonbeamtokenholder' element={<MoonbeamTokenHolder/>}/>
    <Route path='/moonbeambalancehistory' element={<MoonbeamBalanceHistory/>}/>
    <Route path='/moonbeamrewardslash' element={<MoonbeamRewardSlash/>}/>
    <Route path='/moonbeamvotedvalidator' element={<MoonbeamVotedValidator/>}/>
    <Route path='/moonbeamvalidatorlist' element={<MoonbeamValidatorList/>}/>
    <Route path='/moonbeamblocklist' element={<MoonbeamBlockList/>}/>
    <Route path='/moonbeamblockdetails' element={<MoonbeamBlockDetails/>}/>
    <Route path='/moonbeamnftinfo' element={<MoonbeamNFTInfo/>}/>
    <Route path='/moonbeamnftholders' element={<MoonbeamNFTHolders/>}/>
    <Route path='/moonbeamnftacoount' element={<MoonbeamNFTAccountBalance/>}/>
    </Route>
  )
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
   <Navbar/>
   <RouterProvider router={router}/>
  </React.StrictMode>,
)

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DollarSign, Bitcoin, Copy, X, Zap, CheckCircle } from 'lucide-react'
import { useWallet } from '../providers/WalletProvider'
import { ConnectWallet } from '../components/ConnectWallet'
import { useClient } from '../providers/ClientProvider'
import { ethers } from 'ethers'

type Asset = 'Bitcoin'| 'USDT (ETH)' | 'dBTC' | 'dUSDT'
type Tab = 'in' | 'out'

const AssetSelectionModal = ({ isOpen, onClose, onSelect, currentAsset, availableAssets }: { isOpen: boolean, onClose: () => void, onSelect: (asset: Asset) => void, currentAsset: Asset, availableAssets: Asset[] }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-[#132a33] bg-opacity-80 backdrop-blur-xl p-6 rounded-lg shadow-xl max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Select Asset</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-2">
              {availableAssets.map((asset) => (
                <button
                  key={asset}
                  onClick={() => {
                    onSelect(asset)
                    onClose()
                  }}
                  className={`w-full flex items-center p-3 rounded-md transition-colors duration-200 ${
                    asset === currentAsset ? 'bg-[#FF2670] bg-opacity-50 text-white' : 'bg-[#091a1f] bg-opacity-50 text-gray-200 hover:bg-opacity-75'
                  }`}
                >
                  <AssetIcon asset={asset} />
                  <span className="ml-3 text-lg">{asset}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const AssetIcon = ({ asset }: { asset: Asset }) => {
  switch (asset) {
    // case 'Ethereum':
    // case 'dETH':
    //   return <Hexagon className="w-8 h-8 text-blue-400" />
    case 'USDT (ETH)':
    case 'dUSDT':
      return <DollarSign className="w-8 h-8 text-green-400" />
    case 'Bitcoin':
    case 'dBTC':
      return <Bitcoin className="w-8 h-8 text-yellow-500" />
    default:
      return <Zap className="w-8 h-8 text-[#FF2670]" />
  }
}

const TabButton = ({ tab, activeTab, onClick }: { tab: Tab, activeTab: Tab, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`text-lg font-medium transition-colors duration-300 ${
      activeTab === tab
        ? 'text-[#FF2670] border-b-2 border-[#FF2670]'
        : 'text-gray-400 hover:text-gray-200'
    }`}
  >
    {tab === 'in' ? 'Bridge In' : 'Bridge Out'}
  </button>
)

const WaveButton = ({ onClick, children }: { onClick: () => void, children: React.ReactNode }) => (
  <button
    onClick={onClick}
    className="w-full bg-[#FF2670] text-white px-8 py-5 rounded-md font-semibold hover:bg-opacity-80 transition-all duration-300 flex items-center justify-center text-xl relative overflow-hidden group"
  >
    <span className="relative z-10 flex items-center justify-center">
      {children}
    </span>
    <span className="absolute inset-0 bg-white opacity-25 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></span>
  </button>
)

const BitcoinBridgeIn = () => {
  const [address, setAddress] = useState('')
  const [copied, setCopied] = useState(false)

  const {client} = useClient();
  const { account } = useWallet();

  const generateAddress = () => {
    client.getBitcoinAddress(account).then(data => {
        setAddress(data.address);
    })
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      {address ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#132a33] bg-opacity-50 p-6 rounded-md space-y-4"
        >
          <p className="text-white text-lg text-center">Send Bitcoin to address:</p>
          <div className="flex items-center justify-between bg-[#091a1f] p-4 rounded">
            <span className="text-[#FF2670] font-mono text-sm sm:text-base break-all">{address}</span>
            <button
              onClick={copyToClipboard}
              className={`ml-2 p-2 rounded-full transition-colors duration-300 ${
                copied ? 'bg-green-500' : 'bg-[#FF2670] hover:bg-opacity-80'
              }`}
            >
              {copied ? <CheckCircle size={20} className="text-white" /> : <Copy size={20} className="text-white" />}
            </button>
          </div>
          <p className="text-white text-lg text-center">and receive dBTC automatically</p>
        </motion.div>
      ) : (
        <WaveButton onClick={generateAddress}>
          Generate Address
        </WaveButton>
      )}
    </div>
  )
}

// const EthereumBridgeIn = () => {
//   const [amount, setAmount] = useState('')

//   return (
//     <div className="space-y-4">
//       <div>
//         <label htmlFor="amount" className="block text-lg font-medium text-gray-300 mb-3">
//           Amount
//         </label>
//         <input
//           type="number"
//           id="amount"
//           value={amount}
//           onChange={(e) => setAmount(e.target.value)}
//           className="w-full px-6 py-5 bg-[#132a33] bg-opacity-50 text-white text-lg rounded-md focus:outline-none transition-all duration-300 focus:bg-opacity-75"
//           placeholder="0.00"
//         />
//       </div>
//       <WaveButton onClick={() => console.log('Initiate Ethereum transfer')}>
//         Initiate Transfer
//       </WaveButton>
//     </div>
//   )
// }

const USDTBridgeIn = () => {
  const [amount, setAmount] = useState('')

  const { account, signer } = useWallet();

  const peginUSDT = async () => {

    const USDT_CONTRACT_ETH = import.meta.env.VITE_USDT_CONTRACT_ETH;
    const BRIDGE_CONTRACT_ETH = import.meta.env.VITE_BRIDGE_CONTRACT_ETH;
  

    try {
      const ethereumMainnetChainId = '0x1';
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ethereumMainnetChainId }],
      });

      const usdtAbi = [
        'function approve(address spender, uint256 amount) public returns (bool)',
        'function allowance(address owner, address spender) public view returns (uint256)',
      ];

      const usdtContract = new ethers.Contract(USDT_CONTRACT_ETH, usdtAbi, signer);

      const amountInWei = ethers.parseUnits(amount, 6);
      const tx = await usdtContract.approve(BRIDGE_CONTRACT_ETH, amountInWei);

      await tx.wait();
      console.log('Allowance set for Bridge Contract.');

      const bridgeAbi = [
        'function initBridge(uint256 amount, address destinationAddress) public',
      ];
      const bridgeContract = new ethers.Contract(BRIDGE_CONTRACT_ETH, bridgeAbi, signer);

      const bridgeTx = await bridgeContract.initBridge(amountInWei, account);
      await bridgeTx.wait();

      alert('USDT successfully bridged!');
    } catch (error) {
      console.error('Error initiating bridge:', error);
      alert('Failed to initiate bridge.');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="amount" className="block text-lg font-medium text-gray-300 mb-3">
          Amount
        </label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full px-6 py-5 bg-[#132a33] bg-opacity-50 text-white text-lg rounded-md focus:outline-none transition-all duration-300 focus:bg-opacity-75"
          placeholder="0.00"
        />
      </div>
      <WaveButton onClick={() => peginUSDT()}>
        Initiate Transfer
      </WaveButton>
    </div>
  )
}

const BitcoinBridgeOut = () => {
    const [amount, setAmount] = useState('');
    const [destinationAddress, setDestinationAddress] = useState('');
    const { signer } = useWallet(); 
    
    const BITCOIN_BRIDGE_ADDRESS_DOTFI = import.meta.env.VITE_BITCOIN_BRIDGE_ADDRESS_DOTFI;
    const BITCOIN_TOKEN_ADDRESS = import.meta.env.VITE_BITCOIN_TOKEN_ADDRESS;
  
    const initiateBridgeOut = async () => {
      if (!signer) {
        alert('Please connect your wallet.');
        return;
      }
  
      try {
        const tokenAbi = [
          'function approve(address spender, uint256 amount) public returns (bool)',
          'function allowance(address owner, address spender) public view returns (uint256)'
        ];
  
        const tokenContract = new ethers.Contract(BITCOIN_TOKEN_ADDRESS, tokenAbi, signer);
        const amountInWei = ethers.parseUnits(amount, 18); 
  
        const tx = await tokenContract.approve(BITCOIN_BRIDGE_ADDRESS_DOTFI, amountInWei);
        await tx.wait(); 
  
        const bridgeAbi = [
          'function requestBridgeOut(uint256 amount, address destinationAddress) public',
        ];
        const bridgeContract = new ethers.Contract(BITCOIN_BRIDGE_ADDRESS_DOTFI, bridgeAbi, signer);
  
        const bridgeTx = await bridgeContract.requestBridgeOut(amountInWei, destinationAddress);
        await bridgeTx.wait();
  
      } catch (error) {
        console.error('Error initiating bridge out:', error);
        alert('Failed to initiate bridge out.');
      }
    };
  
    return (
      <div className="space-y-4">
        <div>
          <label htmlFor="amount" className="block text-lg font-medium text-gray-300 mb-3">
            Amount
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-6 py-5 bg-[#132a33] bg-opacity-50 text-white text-lg rounded-md focus:outline-none transition-all duration-300 focus:bg-opacity-75"
            placeholder="0.00"
          />
        </div>
        <div>
          <label htmlFor="destinationAddress" className="block text-lg font-medium text-gray-300 mb-3">
            Destination Address
          </label>
          <input
            type="text"
            id="destinationAddress"
            value={destinationAddress}
            onChange={(e) => setDestinationAddress(e.target.value)}
            className="w-full px-6 py-5 bg-[#132a33] bg-opacity-50 text-white text-lg rounded-md focus:outline-none transition-all duration-300 focus:bg-opacity-75"
            placeholder="Enter destination address"
          />
        </div>
        <WaveButton onClick={initiateBridgeOut}>
          Initiate Transfer
        </WaveButton>
      </div>
    );
  };

  const USDTBridgeOut = () => {
    const [amount, setAmount] = useState('');
    const [destinationAddress, setDestinationAddress] = useState('');
    const { signer } = useWallet(); 
  
    const USDT_CONTRACT_DOTFI = import.meta.env.VITE_USDT_CONTRACT_DOTFI;
    const BRIDGE_CONTRACT_DOTFI = import.meta.env.VITE_BRIDGE_CONTRACT_DOTFI;
  
    const initiateBridgeOut = async () => {
      try {
        const tokenAbi = [
          'function approve(address spender, uint256 amount) public returns (bool)',
          'function allowance(address owner, address spender) public view returns (uint256)'
        ];
  
        const tokenContract = new ethers.Contract(USDT_CONTRACT_DOTFI, tokenAbi, signer);
        const amountInWei = ethers.parseUnits(amount, 18); 
  
        const tx = await tokenContract.approve(BRIDGE_CONTRACT_DOTFI, amountInWei);
        await tx.wait();
  
        const bridgeAbi = [
          'function requestBridgeOut(uint256 amount, address destinationAddress) public',
        ];
        const bridgeContract = new ethers.Contract(BRIDGE_CONTRACT_DOTFI, bridgeAbi, signer);
  
        const bridgeTx = await bridgeContract.requestBridgeOut(amountInWei, destinationAddress);
        await bridgeTx.wait();
  
        alert('USDT successfully transferred out!');
      } catch (error) {
        console.error('Error initiating bridge out:', error);
        alert('Failed to initiate bridge out.');
      }
    };
  
    return (
      <div className="space-y-4">
        <div>
          <label htmlFor="amount" className="block text-lg font-medium text-gray-300 mb-3">
            Amount
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-6 py-5 bg-[#132a33] bg-opacity-50 text-white text-lg rounded-md focus:outline-none transition-all duration-300 focus:bg-opacity-75"
            placeholder="0.00"
          />
        </div>
        <div>
          <label htmlFor="destinationAddress" className="block text-lg font-medium text-gray-300 mb-3">
            Destination Address
          </label>
          <input
            type="text"
            id="destinationAddress"
            value={destinationAddress}
            onChange={(e) => setDestinationAddress(e.target.value)}
            className="w-full px-6 py-5 bg-[#132a33] bg-opacity-50 text-white text-lg rounded-md focus:outline-none transition-all duration-300 focus:bg-opacity-75"
            placeholder="Enter destination address"
          />
        </div>
        <WaveButton onClick={initiateBridgeOut}>
          Initiate Transfer
        </WaveButton>
      </div>
    );
  };
  
export const Bridge = () => {
  const [activeTab, setActiveTab] = useState<Tab>('in')
  const [selectedAsset, setSelectedAsset] = useState<Asset>('Bitcoin')
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false)

  const bridgeInAssets: Asset[] = ['Bitcoin', 'USDT (ETH)']
  const bridgeOutAssets: Asset[] = ['dBTC', 'dUSDT']

  const { account } = useWallet();

  if (!account) {
    return <ConnectWallet />
  }
  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative max-w-xl w-full  -mt-[10vh]"
      >
        <div className="absolute inset-0 bg-[#091a1f] bg-opacity-60 backdrop-blur-xl rounded-lg shadow-lg"></div>
        <motion.div
          className="relative z-10 px-10 py-10 overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.div
            className="absolute inset-0 z-0"
            animate={{
              background: [
                'radial-gradient(circle, rgba(255,38,112,0.1) 0%, rgba(9,26,31,0.1) 100%)',
                'radial-gradient(circle, rgba(9,26,31,0.1) 0%, rgba(255,38,112,0.1) 100%)',
              ],
            }}
            transition={{ duration: 10, repeat: Infinity, repeatType: 'reverse' }}
          />
          <div className="relative z-10">
            <motion.h2
              className="text-4xl font-bold mb-8 text-center text-[#FFFFFF]"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Bridge Assets
            </motion.h2>
            
            <div className="flex justify-center space-x-8 mb-8">
              <TabButton tab="in" activeTab={activeTab} onClick={() => setActiveTab('in')} />
              <TabButton tab="out" activeTab={activeTab} onClick={() => setActiveTab('out')} />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-6">
                  <label htmlFor="fromAsset" className="block text-lg font-medium text-gray-300 mb-3">
                    Select Asset
                  </label>
                  <button
                    onClick={() => setIsAssetModalOpen(true)}
                    className="flex items-center justify-between w-full px-6 py-5 bg-[#132a33] bg-opacity-50 rounded-md text-white focus:outline-none transition-all duration-300 hover:bg-opacity-75"
                  >
                    <span className="flex items-center">
                      <AssetIcon asset={selectedAsset} />
                      <span className="ml-3 text-lg">{selectedAsset}</span>
                    </span>
                  </button>
                </div>
                {activeTab === 'in' ? (
                  <>
                    <div className="mb-6">
                      <label htmlFor="toAsset" className="block text-lg font-medium text-gray-300 mb-3">
                        To
                      </label>
                      <div className="flex items-center px-6 py-5 bg-[#132a33] bg-opacity-50 rounded-md">
                        <Zap className="w-8 h-8 text-[#FF2670]" />
                        <span className="ml-3 text-lg text-white">DOTfi</span>
                      </div>
                    </div>
                    {selectedAsset === 'Bitcoin' && <BitcoinBridgeIn />}
                    {/* {selectedAsset === 'Ethereum' && <EthereumBridgeIn />} */}
                    {selectedAsset === 'USDT (ETH)' && <USDTBridgeIn />}
                  </>
                ) : (
                 <>
                    {selectedAsset === 'dBTC' && <BitcoinBridgeOut />}
                    {selectedAsset === 'dUSDT' && <USDTBridgeOut />}
                 </>
                )}
              
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>

      <AssetSelectionModal
        isOpen={isAssetModalOpen}
        onClose={() => setIsAssetModalOpen(false)}
        onSelect={setSelectedAsset}
        currentAsset={selectedAsset}
        availableAssets={activeTab === 'in' ? bridgeInAssets : bridgeOutAssets}
      />
    </div>
  )
}
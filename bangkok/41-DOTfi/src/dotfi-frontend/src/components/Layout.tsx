import { useWallet } from '../providers/WalletProvider';
import { useState, useEffect } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'

export default function Layout() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const location = useLocation();
  
  const { account, connectWallet, disconnectWallet } = useWallet();

  useEffect(() => {
    const updateMousePosition = (ev: MouseEvent) => {
      setMousePosition({ x: ev.clientX, y: ev.clientY });
    };
    window.addEventListener("mousemove", updateMousePosition);
    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
    };
  }, []);

  return (
    <div className="font-montserrat min-h-screen flex flex-col bg-[#091a1f] text-white relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-10">
        <svg width="100%" height="100%">
          <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#ffffff" />
          </pattern>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 38, 112, 0.15) 0%, rgba(9, 26, 31, 0.5) 50%, transparent 100%)`,
        }}
      />

      <header className="relative z-100 bg-[#132a33] bg-opacity-70 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold mr-8">
                <span className="text-[#FF2670]">DOT</span>
                <span className="text-white">fi</span>
              </Link>
              <nav className="hidden md:flex space-x-6">
                <Link 
                  to="/bridge" 
                  className={`hover:text-[#FF2670] transition-colors px-3 py-2 rounded-md ${location.pathname === '/bridge' ? 'text-[#FF2670]' : 'text-white'}`}
                >
                  Bridge
                </Link>
                <Link 
                  to="/swap" 
                  className={`hover:text-[#FF2670] transition-colors px-3 py-2 rounded-md ${location.pathname === '/swap' ? 'text-[#FF2670]' : 'text-white'}`}
                >
                  Swap
                </Link>
                <Link 
                  to="/lending" 
                  className={`hover:text-[#FF2670] transition-colors px-3 py-2 rounded-md ${location.pathname === '/lending' ? 'text-[#FF2670]' : 'text-white'}`}
                >
                  Lend & Borrow
                </Link>
              </nav>
            </div>

            {!account ? (
              <button 
                onClick={connectWallet}
                className="bg-[#FF2670] text-white px-4 py-2 rounded hover:bg-opacity-80 transition-colors duration-300"
              >
                Connect Wallet
              </button>
            ) : (
              <div className="flex items-center space-x-4">
                <p className="bg-[#132a33] text-white px-4 py-2 rounded">{account.slice(0, 6)}...{account.slice(-4)}</p>
                <button 
                  onClick={disconnectWallet}
                  className="bg-[#FF2670] text-white px-4 py-2 rounded hover:bg-opacity-80 transition-colors duration-300"
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow relative z-10 p-4 md:p-6 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>

      <footer className="relative z-10 text-center p-4 md:p-6">
        <p className="text-sm text-gray-400">
          Built for Polkadot 2024 Hackathon: Hopefully see you in Bangkok
        </p>
      </footer>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRightLeft, Sailboat, BookOpen, PiggyBank } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const cryptocurrencies = ["Bitcoin", "Ethereum", "USDT"]

const cards = [
  { title: "Bridge", icon: Sailboat, description: "Seamlessly transfer assets between blockchains", path: "/bridge" },
  { title: "Swap", icon: ArrowRightLeft, description: "Exchange cryptocurrencies with ease", path: "/swap" },
  { title: "Lend & Borrow", icon: PiggyBank, description: "Earn interest on your crypto assets", path: "/lending" },
  { title: "Perpetual", icon: BookOpen, description: "Description for perp (?)", path: "/perpetual" },
]

export const Home = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const updateMousePosition = (ev: MouseEvent) => {
      setMousePosition({ x: ev.clientX, y: ev.clientY });
    };
    window.addEventListener("mousemove", updateMousePosition);
    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % cryptocurrencies.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-[#091a1f] overflow-hidden flex flex-col items-center justify-center px-4 py-12 font-montserrat">
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
      <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-8 text-center z-10 relative inline-block">
        <span className="text-[#FF2670]">DOT</span>
        <span className="text-white">fi</span>
        <div className="absolute -bottom-2 left-0 w-full h-1 bg-[#FF2670]"></div>
      </h1>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-white text-center z-10 mb-16"
        >
          Bring <span className="font-bold text-[#FF2670]">{cryptocurrencies[currentIndex]}</span> to Polkadot
        </motion.div>
      </AnimatePresence>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 z-10 w-full max-w-6xl">
        {cards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-[#132a33] bg-opacity-30 backdrop-blur-sm rounded-lg p-6 flex flex-col items-center text-center hover:bg-opacity-70 transition-all duration-300 cursor-pointer group"
            onClick={() => navigate(card.path)}
          >
            <motion.div
              className="mb-4"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <card.icon className="w-12 h-12 text-[#FF2670] group-hover:text-white transition-colors duration-300" />
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-2">{card.title}</h2>
            <p className="text-gray-300">{card.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
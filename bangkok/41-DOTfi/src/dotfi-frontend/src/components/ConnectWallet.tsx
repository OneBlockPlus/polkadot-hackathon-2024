import { motion } from 'framer-motion'
import { Wallet2 } from 'lucide-react'


export const ConnectWallet = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative max-w-md w-full mx-auto mt-[20vh]"
    >
      <div className="absolute inset-0 bg-[#0A1A1F] bg-opacity-60 backdrop-blur-xl rounded-lg shadow-lg"></div>
      <motion.div
        className="relative z-10 p-8 overflow-hidden"
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
        <div className="relative z-10 text-center">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-6"
          >
            <Wallet2 className="w-16 h-16 text-[#FF2670] mx-auto" />
          </motion.div>
          <motion.h2
            className="text-3xl font-bold mb-4 text-white"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Connect Wallet
          </motion.h2>
          <motion.p
            className="text-gray-300 mb-8"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            Connect your wallet to access platform features.
          </motion.p>
        </div>
      </motion.div>
    </motion.div>
  )
}
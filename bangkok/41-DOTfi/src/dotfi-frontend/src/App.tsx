import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import { Bridge, Home, Lending, Swap } from './pages'
import { WalletProvider } from './providers/WalletProvider'
import { ClientProvider } from './providers/ClientProvider'


function App() {
  return (
    <WalletProvider>
      <ClientProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route element={<Layout />}>
              <Route path="bridge" element={<Bridge />} />
              <Route path="swap" element={<Swap />} />
              <Route path="lending" element={<Lending />} />
            </Route>
          </Routes>
        </Router>
      </ClientProvider>
    </WalletProvider>
  )
}

export default App
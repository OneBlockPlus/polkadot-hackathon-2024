import React, {useState} from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import AddVideo from './components/AddVideo';
import VideoList from './components/VideoList';
import Checkout from './components/Checkout';
import Withdraw from './components/Withdraw';
import Landing from './components/Landing';
import NavBar from './components/NavBar';
import WalletLoading from './components/WalletLoading';
import {PolkadotProvider} from './context/PolkadotContext';

const App = () => {

  const [videos, setVideos] = useState([]);

  // Callback to handle adding new videos
  const handleVideoAdded = (newVideo) => {
    setVideos(prevVideos => [newVideo, ...prevVideos]);
  };

  return (
    <Router>
      <PolkadotProvider>
        <NavBar/>
        <div style={styles.background}>
          <div style={styles.container}>
            <Routes>
              <Route path="/" element={<Landing/>}/>
              <Route path="/manager" element={
                <WalletLoading>
                  <div>
                    <AddVideo onVideoAdded={handleVideoAdded}/>
                    <VideoList videos={videos} setVideos={setVideos}/>
                  </div>
                </WalletLoading>
              }/>
              <Route path="/checkout" element={
                <WalletLoading>
                  <Checkout/>
                </WalletLoading>
              }/>
              <Route path="/withdraw" element={
                <WalletLoading>
                  <Withdraw/>
                </WalletLoading>
              }/>
            </Routes>
          </div>
        </div>
      </PolkadotProvider>
    </Router>
  );
};

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: "'Poppins', sans-serif",
  },
  background: {
    backgroundColor: '#E7E6E3',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  }
};

export default App;
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
                    <AddVideo onVideoAdded={handleVideoAdded}/>
                    <VideoList videos={videos} setVideos={setVideos}/>
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
    margin: '0 auto',
    fontFamily: "'Nunito', sans-serif",

  },
  background: {
    background: '#2A183E'
  }
};

export default App;
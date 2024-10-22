import React, { useState, useEffect } from 'react';
import { initWeb3 } from './utils/contractInteraction';
import SearchBar from './components/SearchBar';
import ItemList from './components/ItemList';
import ProfilePage from './components/ProfilePage';
import ChatPage from './components/ChatPage';
import './App.css'; // 我们将创建这个文件
import styled from 'styled-components';
import { ThemeProvider } from 'styled-components';

const lightTheme = {
  // ... 亮色主题定义 ...
};

const darkTheme = {
  // ... 暗色主题定义 ...
};

const ChatContainer = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%; // 增加宽度
  max-width: 400px; // 设置最大宽度
  height: 80vh; // 使用视口高度
  max-height: 600px; // 设置最大高度
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 10px;
  overflow: hidden; // 隐藏溢出内容
  box-shadow: 0 0 20px rgba(0,0,0,0.2);
  z-index: 1000;
`;

function App() {
    const [selectedItem, setSelectedItem] = useState(null);
    const [showProfile, setShowProfile] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentUser, setCurrentUser] = useState(""); // 将存储钱包地址
    const [web3Instance, setWeb3Instance] = useState(null);
    const [refreshItemList, setRefreshItemList] = useState(false);
    const [theme, setTheme] = useState(lightTheme);
    const [forceUpdate, setForceUpdate] = useState(0);
    const [chatKey, setChatKey] = useState(0); // 新增状态

    useEffect(() => {
        const initializeWeb3 = async () => {
            const { web3 } = await initWeb3();
            setWeb3Instance(web3);
            const accounts = await web3.eth.getAccounts();
            if (accounts.length > 0) {
                setCurrentUser(accounts[0]);
            }
        };
        initializeWeb3();
    }, []);

    const handleItemSelect = (item) => {
        setSelectedItem(item);
        console.log('显示物品详情:', item);
    };

    const handleChatClick = (item) => {
        console.log('handleChatClick called with item:', item);
        setSelectedItem(item);
        setShowChat(true);
        setChatKey(prevKey => prevKey + 1); // 每次打开聊天时更新 key
        // 强制重新渲染
        setForceUpdate(prev => prev + 1);
    };

    const handleCloseChat = () => {
        setShowChat(false);
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
    };

    const handleItemListed = () => {
        setRefreshItemList(prev => !prev);
    };

    return (
        <ThemeProvider theme={theme}>
            <div className="app-container">
                <h1 className="app-title">LibMarket</h1>
                <button onClick={() => setShowProfile(!showProfile)} className="profile-button">
                    {showProfile ? 'Back to Home' : 'Personal Page'}
                </button>
                {!showProfile ? (
                    <>
                        <SearchBar onSearch={handleSearch} />
                        <div className="content-container">
                            <ItemList 
                                onItemSelect={handleItemSelect} 
                                onChatClick={handleChatClick}
                                searchQuery={searchQuery}
                                refresh={refreshItemList}
                                currentUser={currentUser}  // 添加这一行
                            />
                        </div>
                    </>
                ) : (
                    <ProfilePage walletAddress={currentUser} onItemListed={handleItemListed} />
                )}
                {/* 调试信息 */}
                <div style={{position: 'fixed', bottom: 0, left: 0, background: 'white', padding: '10px', zIndex: 1001}}>
                    Debug: showChat: {showChat.toString()}, selectedItem: {selectedItem ? JSON.stringify(selectedItem) : 'null'}
                </div>
            </div>
            {/* ChatContainer 移到这里 */}
            {showChat && selectedItem && (
                <ChatContainer key={chatKey}>
                    <ChatPage 
                        item={selectedItem} 
                        onClose={handleCloseChat} 
                        currentUser={currentUser}
                    />
                </ChatContainer>
            )}
        </ThemeProvider>
    );
}

export default App;
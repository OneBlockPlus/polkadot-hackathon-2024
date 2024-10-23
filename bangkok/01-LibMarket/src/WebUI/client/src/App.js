import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  top: ${props => props.position.y}px;
  left: ${props => props.position.x}px;
  width: 90%;
  max-width: 400px;
  height: 80vh;
  max-height: 600px;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(0,0,0,0.2);
  z-index: 1000;
  cursor: move; // 添加这行，使整个容器显示为可移动状态
`;

const ChatHeader = styled.div`
  padding: 10px;
  background-color: #4CAF50;
  color: white;
  user-select: none;
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
    const [chatPosition, setChatPosition] = useState({ x: 100, y: 100 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const chatContainerRef = useRef(null);

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
        setSelectedItem(item);
        setShowChat(true);
        setChatKey(prevKey => prevKey + 1);
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

    const handleMouseDown = useCallback((e) => {
        // 检查是否点击了输入框或按钮
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') {
            return;
        }
        setIsDragging(true);
        const rect = chatContainerRef.current.getBoundingClientRect();
        setDragOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
    }, []);

    const handleMouseMove = useCallback((e) => {
        if (isDragging) {
            e.preventDefault(); // 防止选中文本
            const newX = e.clientX - dragOffset.x;
            const newY = e.clientY - dragOffset.y;
            setChatPosition({ x: newX, y: newY });
        }
    }, [isDragging, dragOffset]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        } else {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

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
                                currentUser={currentUser}
                            />
                        </div>
                    </>
                ) : (
                    <ProfilePage walletAddress={currentUser} onItemListed={handleItemListed} />
                )}
                {showChat && selectedItem && (
                    <ChatContainer 
                        position={chatPosition}
                        ref={chatContainerRef}
                        onMouseDown={handleMouseDown}
                    >
                        <ChatHeader>
                            Chat - Drag anywhere
                        </ChatHeader>
                        <ChatPage 
                            key={chatKey}
                            item={selectedItem} 
                            onClose={handleCloseChat} 
                            currentUser={currentUser}
                        />
                    </ChatContainer>
                )}
            </div>
        </ThemeProvider>
    );
}

export default App;

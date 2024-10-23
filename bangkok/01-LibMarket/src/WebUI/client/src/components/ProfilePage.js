import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import SellForm from './SellForm';
import './ProfilePage.css';
import SellerChatList from './SellerChatList';
import styled from 'styled-components';

// 添加这些新的样式组件
const ChatContainer = styled.div`
  display: flex;
  height: 600px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
`;

const ChatListContainer = styled.div`
  width: 30%;
  border-right: 1px solid #e0e0e0;
  overflow-y: auto;
`;

const ChatInterfaceContainer = styled.div`
  width: 70%;
  display: flex;
  flex-direction: column;
`;

const ChatHeader = styled.div`
  padding: 15px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
`;

const ChatMessages = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  padding: 15px;
`;

const ChatInputContainer = styled.div`
  display: flex;
  padding: 15px;
  border-top: 1px solid #e0e0e0;
`;

const ChatInput = styled.input`
  flex-grow: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 20px;
  margin-right: 10px;
`;

const SendButton = styled.button`
  padding: 10px 20px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  &:hover {
    background-color: #3a7bc8;
  }
`;

function ProfilePage({ walletAddress, onItemListed }) {
    const [activeTab, setActiveTab] = useState('myItems');
    const [myItems, setMyItems] = useState([]);
    const [myChats, setMyChats] = useState({});
    const [selectedChat, setSelectedChat] = useState(null);
    const [inputMessage, setInputMessage] = useState('');
    const messagesEndRef = useRef(null);
    const socket = useRef(null);

    useEffect(() => {
        fetchUserItems();
        fetchUserChats();

        socket.current = io('http://localhost:5000');
        console.log('Socket connection established');

        socket.current.on('connect', () => {
            console.log('Socket connected successfully');
            socket.current.emit('join', { userId: walletAddress });
        });

        socket.current.on('receiveMessage', (message) => {
            console.log('Received new message:', message);
            setMyChats(prevChats => {
                const updatedChats = { ...prevChats };
                if (!updatedChats[message.itemId]) {
                    updatedChats[message.itemId] = [];
                }
                updatedChats[message.itemId].push(message);
                return updatedChats;
            });
        });

        return () => {
            if (socket.current) {
                socket.current.disconnect();
            }
        };
    }, [walletAddress]);

    const fetchUserItems = async () => {
        if (!walletAddress) return;
        try {
            const response = await axios.get(`http://localhost:5000/api/items?seller=${walletAddress}`);
            setMyItems(response.data);
        } catch (error) {
            console.error('获取用户物品失败:', error);
        }
    };

    const fetchUserChats = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/user-chats/${walletAddress}`);
            console.log('Fetched chats:', response.data); // 添加日志
            setMyChats(response.data);
        } catch (error) {
            console.error('获取用户聊天失败:', error);
        }
    };

    useEffect(() => {
        const fetchUserChats = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/user-chats/${walletAddress}`);
                console.log('Fetched chats:', response.data);
                setMyChats(response.data);
            } catch (error) {
                console.error('获取用户聊天失败:', error);
            }
        };

        if (walletAddress) {
            fetchUserChats();
        }
    }, [walletAddress]);

    const handleToggleListing = async (itemId, currentStatus) => {
        try {
            console.log('Attempting to toggle listing for item:', itemId);
            const response = await axios.put(`http://localhost:5000/api/items/${itemId}/toggle-listing`);
            console.log('Toggle listing response:', response.data);
            fetchUserItems();
            alert(currentStatus ? 'Item successfully delisted' : 'Item successfully listed');
        } catch (error) {
            console.error('Failed to update item status:', error);
            if (error.response) {
                console.error('Error response:', error.response.data);
                alert(`Failed to update item status. Please try again. Error: ${error.response.data.message || 'Unknown error'}`);
            } else {
                alert(`Failed to update item status. Please try again. Error: ${error.message || 'Unknown error'}`);
            }
        }
    };

    const sendMessage = async () => {
        if (!inputMessage.trim()) return;

        const newMessage = {
            itemId: selectedChat,
            sender: walletAddress,
            text: inputMessage,
            timestamp: new Date(),
            isBuyer: false // 假设卖家不是买家
        };

        try {
            const response = await axios.post('http://localhost:5000/api/messages', newMessage);
            console.log('Message sent:', response.data);
            setMyChats(prevChats => ({
                ...prevChats,
                [selectedChat]: [...(prevChats[selectedChat] || []), response.data]
            }));
            setInputMessage('');
        } catch (error) {
            console.error('发送消息失败:', error);
        }
    };

    const renderChatInterface = () => {
        return (
            <ChatContainer>
                <ChatListContainer>
                    <SellerChatList 
                        sellerId={walletAddress} 
                        onChatSelect={(itemId, messages) => {
                            setSelectedChat(itemId);
                            setMyChats(prevChats => ({...prevChats, [itemId]: messages}));
                        }}
                    />
                </ChatListContainer>
                {selectedChat && (
                    <ChatInterfaceContainer>
                        <ChatHeader>
                            <h3>Chat History - itemID: {selectedChat}</h3>
                        </ChatHeader>
                        <ChatMessages>
                            {myChats[selectedChat] && myChats[selectedChat].map((message, index) => (
                                <div key={index} className={`message ${message.sender === walletAddress ? 'sent' : 'received'}`}>
                                    <p>{message.text}</p>
                                    <span>{new Date(message.timestamp).toLocaleString()}</span>
                                    <span className="sender">{message.sender === walletAddress ? 'Me' : 'buyer'}</span>
                                </div>
                            ))}
                        </ChatMessages>
                        <ChatInputContainer>
                            <ChatInput
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                placeholder="Input Message..."
                            />
                            <SendButton onClick={sendMessage}>Sen</SendButton>
                        </ChatInputContainer>
                    </ChatInterfaceContainer>
                )}
            </ChatContainer>
        );
    };

    const handleItemListed = () => {
        fetchUserItems(); // 重新获取用户物品列表
    };

    return (
        <div className="profile-page">
            <h2>Profile</h2>
            <div className="profile-tabs">
                <button 
                    className={activeTab === 'myItems' ? 'active' : ''} 
                    onClick={() => setActiveTab('myItems')}
                >
                    My Items
                </button>
                <button 
                    className={activeTab === 'myChats' ? 'active' : ''} 
                    onClick={() => setActiveTab('myChats')}
                >
                    Chats
                </button>
                <button 
                    className={activeTab === 'completedDeals' ? 'active' : ''} 
                    onClick={() => setActiveTab('completedDeals')}
                >
                    Completed Deals
                </button>
                <button 
                    className={activeTab === 'sellForm' ? 'active' : ''} 
                    onClick={() => setActiveTab('sellForm')}
                >
                    List New Item
                </button>
            </div>
            <div className="profile-content">
                {activeTab === 'myItems' && (
                    <div className="my-items-grid">
                        {myItems.map(item => (
                            <div key={item._id} className="item-card">
                                <h3>{item.name}</h3>
                                <p>Price: DOT{item.price}</p>
                                <button onClick={() => handleToggleListing(item._id, item.isListed)}>
                                    {item.isListed ? 'Delist' : 'List'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                {activeTab === 'myChats' && renderChatInterface()}
                {activeTab === 'sellForm' && (
                    <div className="sell-form-container">
                        <h3>List New Item</h3>
                        <SellForm onItemListed={handleItemListed} walletAddress={walletAddress} />
                    </div>
                )}
                {/* Other tab contents */}
            </div>
        </div>
    );
}

export default ProfilePage;

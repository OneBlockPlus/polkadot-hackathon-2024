import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import './ChatPage.css'; // 确保导入样式

const formatAddress = (address) => {
    return address ? `0x${address.slice(-6)}` : 'Unknown';
};

const ChatPageContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: #f5f5f5;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const ChatHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    background-color: #4a90e2;
    color: white;
`;

const ChatContent = styled.div`
    flex-grow: 1;
    overflow-y: auto;
    padding: 15px;
`;

const MessageList = styled.div`
    display: flex;
    flex-direction: column;
`;

const Message = styled.div`
    max-width: 70%;
    padding: 10px;
    margin-bottom: 10px;
    border-radius: 10px;
    animation: fadeIn 0.3s ease-out;
    ${props => props.isSent ? `
        align-self: flex-end;
        background-color: #dcf8c6;
    ` : `
        align-self: flex-start;
        background-color: white;
    `}
`;

const MessageTime = styled.span`
    font-size: 12px;
    color: #999;
    margin-top: 5px;
    display: block;
`;

const ChatInputContainer = styled.div`
    display: flex;
    padding: 10px;
    background-color: white;
    border-top: 1px solid #ddd;
`;

const MessageInput = styled.input`
    flex-grow: 1;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 20px;
`;

const SendButton = styled.button`
    margin-left: 10px;
    padding: 10px 20px;
    border: none;
    background-color: #4a90e2;
    color: white;
    border-radius: 20px;
    cursor: pointer;
`;

const ChatPage = ({ item, onClose, currentUser, initialMessages = [] }) => {
    const [messages, setMessages] = useState(initialMessages);
    const [inputMessage, setInputMessage] = useState('');
    const ws = useRef(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        ws.current = new WebSocket('ws://localhost:5000/ws');

        ws.current.onopen = () => {
            console.log('WebSocket Connected');
            ws.current.send(JSON.stringify({ type: 'join', itemId: item._id }));
        };

        ws.current.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.itemId === item._id) {
                setMessages(prev => [...prev, message]);
            }
        };

        const fetchMessages = async () => {
            try {
                const response = await axios.get(`/api/messages/${item._id}`);
                setMessages(response.data);
            } catch (error) {
                console.error('获取消息历史失败:', error);
            }
        };
        fetchMessages();

        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, [item._id]);

    const sendMessage = async () => {
        if (!inputMessage.trim()) return;

        const newMessage = {
            itemId: item._id,
            sender: currentUser,
            receiver: item.seller, // 假设接收者是物品的卖家
            text: inputMessage,
            timestamp: new Date(),
            isBuyer: currentUser !== item.seller
        };

        try {
            const response = await axios.post('http://localhost:5000/api/messages', newMessage);
            console.log('Message sent:', response.data);
            setMessages(prevMessages => [...prevMessages, response.data]);
            setInputMessage('');
        } catch (error) {
            console.error('发送消息失败:', error);
        }
    };

    return (
        <ChatPageContainer>
            <ChatHeader>
                <h2>{item.name} - {formatAddress(item.seller)}</h2>
                <button onClick={onClose}>&times;</button>
            </ChatHeader>
            <ChatContent>
                <MessageList>
                    {messages.map((msg, index) => (
                        <Message key={index} isSent={msg.sender === currentUser}>
                            {msg.text}
                            <MessageTime>{new Date(msg.timestamp).toLocaleString()}</MessageTime>
                        </Message>
                    ))}
                    <div ref={messagesEndRef} />
                </MessageList>
            </ChatContent>
            <ChatInputContainer>
                <MessageInput 
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Input Message..."
                />
                <SendButton onClick={sendMessage}>Send</SendButton>
            </ChatInputContainer>
        </ChatPageContainer>
    );
};

export default ChatPage;
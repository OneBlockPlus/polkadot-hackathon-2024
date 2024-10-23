import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';

const ChatListWrapper = styled.div`
  height: 100%;
  overflow-y: auto;
`;

const ChatListTitle = styled.h3`
  padding: 15px;
  margin: 0;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
`;

const ChatItem = styled.div`
  padding: 15px;
  border-bottom: 1px solid #e0e0e0;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #f0f0f0;
  }
`;

const ItemName = styled.p`
  margin: 0 0 5px 0;
  font-weight: bold;
`;

const LastMessage = styled.p`
  margin: 0;
  color: #666;
  font-size: 0.9em;
`;

const Sender = styled.span`
  font-size: 0.8em;
  color: #999;
`;

const SellerChatList = ({ sellerId, onChatSelect }) => {
  const [chats, setChats] = useState([]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/user-chats/${sellerId}`);
        console.log('Fetched chats in SellerChatList:', response.data);
        setChats(response.data);
      } catch (error) {
        console.error('获取聊天列表失败:', error);
      }
    };
    fetchChats();
  }, [sellerId]);

  return (
    <ChatListWrapper>
      <ChatListTitle>My Chats</ChatListTitle>
      {chats.length === 0 ? (
        <ChatItem>No chat history</ChatItem>
      ) : (
        chats.map(({ itemId, itemName, messages }) => (
          <ChatItem key={itemId} onClick={() => onChatSelect(itemId, messages)}>
            <ItemName>{itemName}</ItemName>
            <LastMessage>{messages[messages.length - 1].text}</LastMessage>
            <Sender>
              {messages[messages.length - 1].sender === sellerId ? 'Me' : 'Buyer'}
            </Sender>
          </ChatItem>
        ))
      )}
    </ChatListWrapper>
  );
};

export default SellerChatList;

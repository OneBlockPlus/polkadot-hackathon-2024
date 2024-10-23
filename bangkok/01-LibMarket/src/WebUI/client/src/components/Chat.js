import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

function Chat({ item }) {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');

    useEffect(() => {
        socket.emit('joinRoom', item._id);
        socket.on('receiveMessage', (message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        });
        return () => {
            socket.off('receiveMessage');
        };
    }, [item._id]);

    const sendMessage = () => {
        if (inputMessage.trim()) {
            socket.emit('sendMessage', { itemId: item._id, message: inputMessage });
            setInputMessage('');
        }
    };

    return (
        <div>
            <h3>Chat with sellers</h3>
            <div>
                {messages.map((msg, index) => (
                    <p key={index}>{msg}</p>
                ))}
            </div>
            <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
            />
            <button onClick={sendMessage}>Send</button>
        </div>
    );
}

export default Chat;
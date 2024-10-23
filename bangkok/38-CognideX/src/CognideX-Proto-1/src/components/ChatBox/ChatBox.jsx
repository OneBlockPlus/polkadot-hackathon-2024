import React, { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { fetchAuthSession } from 'aws-amplify/auth';
import axios from 'axios'
import styled from 'styled-components'
import DatasetBubble from './DatasetBubble'

import { useAuth } from '../../context/AuthContext';
import { useError } from '../../context/ErrorContext';

const ChatContainer = styled.div.attrs({ className: 'chat-container' })`
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    border-radius: 10px;
    padding: 8px;
    height: calc(100% - 16px);
    width: calc(100% - 16px);
    border: 2px solid white;
    backdrop-filter: blur(3px);
    transition: all 0.3s;

    &::before,
    &::after {
        position: absolute;
        top: -12px;
        right: -12px;
        width: 90px;
        height: 30px;
        background-color: black;
        border-radius: 9px;
        display: flex;
        justify-content: center;
        align-items: center;
        color: white;
        transition: all 0.3s ease-in-out;
        font-size: 20px;
    }

    &::before {
        content: 'D-GPT';
        opacity: 1;
        transform: translateY(0);
    }

    &::after {
        content: 'Chat';
        opacity: 0;
        transform: translateY(10px);
    }

    &:hover::before {
        opacity: 0;
        transform: translateY(-10px);
    }

    &:hover::after {
        opacity: 1;
        transform: translateY(0);
    }
`

const MessageContainer = styled.div.attrs({ className: 'message-container' })`
    flex-grow: 1;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow-y: auto; /* Make this section scrollable */
    overflow-x: hidden;
    gap: 12px;
    width: auto;
    padding: 19px 9px 4px 4px;

    ::-webkit-scrollbar {
        width: 5px;
    }

    ::-webkit-scrollbar-thumb {
        background-color: #555;
        border-radius: 5px;
        width: 5px;
    }

    ::-webkit-scrollbar-thumb:hover {
        background-color: #888;
    }

`

const Message = styled.div.attrs({ className: 'message' })`
    padding: 10px;
    margin: 0;
    background-color: white;
    border-radius: 10px;
    max-width: 90%;
    height: auto;
    text-align: left;
    align-self: flex-start;
    display: flex;
    flex-direction: column;

    &.user-message {
        align-self: flex-end;
        text-align: left;
        // font-weight: 600;
    }

    &.bot-message {
        border-bottom-left-radius: 0px;
        border-bottom-right-radius: 10px;
    }

    &.user-message {
        border-bottom-left-radius: 10px;
        border-bottom-right-radius: 0px;
    }
`

const ChatInputContainer = styled.div.attrs({
    className: 'chatinput-container',
})`
    display: flex;
    padding: 10px;
    width: auto;
    align-items: flex-end;
    border: 0.3px solid #555;
    border-radius: 10px;
`

const Textarea = styled.textarea.attrs({ className: 'chatinput-textarea' })`
    flex-grow: 1;
    border: none;
    background: none;
    color: #fff;
    border-radius: 10px;
    outline: none;
    resize: none;
    min-height: 45px;
    max-height: 150px;
    overflow-y: auto;
    font-size: 20px;
    font-family: 'Modernist', sans-serif;
    scrollbar-width: none;
`

const SendButton = styled.button.attrs({ className: 'send-button' })`
    display: flex;
    height: 45px;
    width: 45px;
    background-color: none;
    color: #fff;
    border: none;
    border-radius: 5px;
    margin-left: 10px;
    cursor: pointer;
    justify-content: center;
    align-items: center;
`

const DotLoader = styled.div.attrs({ className: 'dot-loader' })`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px;

    > div {
        width: 8px;
        height: 8px;
        background-color: white;
        border-radius: 50%;
        margin: 0 2.5px;
        animation: dot-bounce 1.2s infinite ease-in-out both;

        &:nth-child(1) {
            animation-delay: -0.32s;
        }

        &:nth-child(2) {
            animation-delay: -0.16s;
        }
    }

    @keyframes dot-bounce {
        0%,
        80%,
        100% {
            transform: scale(0);
        }
        40% {
            transform: scale(1);
        }
    }
`

const PromptsContainer = styled.div.attrs({ className: 'prompts-container' })`
    display: grid;
    width: 100%;
    grid-template-columns: 1fr 1fr; /* 2x2 layout */
    gap: 12px;
    border-radius: 5px;
    margin-bottom: 10px;
`

const Prompt = styled.div.attrs({ className: 'prompt' })`
    padding: 5px 10px;
    border-radius: 7px;
    border: 0.3px solid #555;
    color: #c8c3c3;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    flex-direction: column;
    text-align: left;
    gap: 5px;
    font-size: 18px;
    backdrop-filter: blur(5px);

    &:hover {
        box-shadow: 0 0 5px rgba(255, 255, 255, 0.7);
    }

    span {
        color: #f9f9f9;
        font-weight: 600;
        font-size: 20px;
    }
`

const ChatBox = () => {
    const { user } = useAuth();
    const { openErrorModal } = useError();
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [prompts, setPrompts] = useState([
        ['Suggest some datasets to train', 'Suggest some datasets to train a model on predicting S&P 500 Stock Data'],
        ['Suggest some datasets to build', 'a recommendation system on E-commerce Data'],
        ['Suggest some datasets to get insights', "on COVID-19's impact on the economy"],
        ['Suggest some datasets to build', 'a sentiment analysis model on Twitter Data'],
    ])

    const textareaRef = useRef(null)
    const messagesEndRef = useRef(null)


    useLayoutEffect(() => {
        // Adjusting the textarea height dynamically
        textareaRef.current.style.height = 'inherit'
        const currentScrollHeight = textareaRef.current.scrollHeight
        textareaRef.current.style.height = `${Math.min(currentScrollHeight, 150)}px`
    }, [newMessage])

    const handleSendMessage = () => {
        if (newMessage.trim() === '') return;

        addMessage(newMessage, 'You')
        replyMessage(newMessage)
        setNewMessage('')
    }

    const handlePromptMessage = (prompt) => {
        const promptMessage = `${prompt[0]} ${prompt[1]}`
        addMessage(promptMessage, 'You')
        replyMessage(promptMessage)
        setPrompts([])
    }

    const addMessage = (text, user) => {
        setMessages(prev => [...prev, { text, user }])
        scrollToBottom()
    }

    const replyMessage = async (userMessage) => {
        if (!user) {
            openErrorModal({
                errorHeader: 'Authentication',
                errorMessage: <>Please sign in to your account, or create one.</>,
            })
            return;
        }

        setLoading(true)
        try {
            const session = await fetchAuthSession();
            if (!session || !session.tokens || !session.tokens.idToken) {
                console.error('No valid session or token found.');
                return;
            }

            const token = session.tokens.idToken;
            const payload = {
                headers: { Authorization: `Bearer ${token}` },
                body: {
                    session_id: Date.now().toString(),
                    message: userMessage,
                },
            }

            const response = await axios.post(
                'https://d-gpt.cognidex.ai/agent_chat',
                payload.body,
                { headers: payload.headers }
            );

            const botReply = response.data;
            if (botReply.datasets) {
                addBotReplyWithDatasets(botReply.response, botReply.datasets)
            } else {
                addMessage(botReply.response, 'Bot')
            }
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    const addBotReplyWithDatasets = (response, datasets) => {
        const datasetList = datasets.trim().split("\n\n").map(dataset => {
            const [title, link, description] = dataset.split("\n");
            return { title, description, link };
        });

        setMessages(prev => [
            ...prev,
            {
                text: response,
                user: 'Bot',
                datasets: datasetList,
            }
        ]);
        scrollToBottom()
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    }

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className='chat-container'>
            <ChatContainer>
                <MessageContainer>
                    {messages.map((message, index) => (
                        <Message
                            key={index}
                            className={message.user === 'You' ? 'user-message' : 'bot-message'}
                        >
                            {message.text}
                            {message.datasets && (
                                <DatasetBubble datasets={message.datasets} />
                            )}
                        </Message>
                    ))}
                    {loading && (
                        <DotLoader>
                            <div></div><div></div><div></div>
                        </DotLoader>
                    )}
                    <div ref={messagesEndRef} />
                </MessageContainer>
                {prompts.length > 0 && (
                    <PromptsContainer>
                        {prompts.map((prompt, index) => (
                            <Prompt key={index} onClick={() => handlePromptMessage(prompt)}>
                                <span>{prompt[0]}</span>{prompt[1]}
                            </Prompt>
                        ))}
                    </PromptsContainer>
                )}
                <ChatInputContainer>
                    <Textarea
                        ref={textareaRef}
                        placeholder={'Search your dataset...'}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <SendButton onClick={handleSendMessage}>
                        <FontAwesomeIcon icon={faPaperPlane} color='black' size='2x' />
                    </SendButton>
                </ChatInputContainer>
            </ChatContainer>
        </div>
    )
}


export default ChatBox
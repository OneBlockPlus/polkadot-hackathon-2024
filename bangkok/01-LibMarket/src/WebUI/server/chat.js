const WebSocket = require('ws');
const Message = require('./models/Message');
const Item = require('./models/Item');

module.exports = function(server) {
    const wss = new WebSocket.Server({ server, path: '/ws' });

    wss.on('connection', (ws) => {
        console.log('New client connected');

        ws.on('message', async (message) => {
            try {
                const data = JSON.parse(message);
                console.log('Received:', data);

                if (data.type === 'join') {
                    ws.itemId = data.itemId;
                } else if (data.type === 'message') {
                    const newMessage = new Message({
                        itemId: data.itemId,
                        sender: data.sender,
                        text: data.text,
                        timestamp: data.timestamp,
                        isBuyer: data.isBuyer
                    });
                    const savedMessage = await newMessage.save();

                    // 广播消息给所有相关的客户端
                    wss.clients.forEach((client) => {
                        if (client.readyState === WebSocket.OPEN && client.itemId === data.itemId) {
                            client.send(JSON.stringify(savedMessage));
                        }
                    });
                }
            } catch (error) {
                console.error('Error processing message:', error);
            }
        });

        ws.on('close', () => {
            console.log('Client disconnected');
        });
    });
};
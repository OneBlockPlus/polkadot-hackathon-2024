const express = require('express');
const multer = require('multer');
const path = require('path');
const app = express();
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const WebSocket = require('ws');
const setupWebSocket = require('./chat');
const Message = require('./models/Message');
const Item = require('./models/Item'); // 添加这行

// 创建 HTTP 服务器
const server = http.createServer(app);

// 设置 Socket.IO
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

mongoose.connect('mongodb://127.0.0.1:27017/shopping', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

mongoose.connection.on('error', err => {
    console.error('MongoDB connection error:', err);
});

app.use(cors());
app.use(express.json());

// 设置 multer 存储配置
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// 获取物品的API
app.get('/api/items', async (req, res) => {
    try {
        const { seller } = req.query;
        let query = {};
        if (seller) {
            query.seller = seller;
        }
        const items = await Item.find(query);
        res.json(items);
    } catch (error) {
        console.error('Failed to get item list:', error);
        res.status(500).json({ message: 'Failed to get item list', error: error.message });
    }
});

// 发布物品的API
app.post('/api/items', upload.single('image'), async (req, res) => {
    console.log('Received POST request to /api/items');
    console.log('Request body:', req.body);
    console.log('File:', req.file);
    try {
        const newItem = new Item({
            name: req.body.name,
            price: req.body.price,
            description: req.body.description,
            image: req.file ? req.file.filename : null, // 只保存文件名
            seller: req.body.seller
        });
        await newItem.save();
        console.log('New item saved:', newItem);
        res.json(newItem);
    } catch (error) {
        console.error('Error saving item:', error);
        res.status(500).json({ message: 'Failed to save item', error: error.message });
    }
});

// 添加这个新的路由来获取聊天历史
app.get('/api/messages/:itemId', async (req, res) => {
    try {
        const messages = await Message.find({ itemId: req.params.itemId }).sort('timestamp');
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: '获取消息失败', error: error.message });
    }
});

// 聊天功能
io.on('connection', (socket) => {
    console.log('User connected');
    console.log('User joined room: ', socket.id);
    console.log('User disconnected');

    socket.on('joinRoom', (itemId) => {
        socket.join(itemId);
        console.log(`User joined room: ${itemId}`);
    });

    socket.on('sendMessage', async ({ itemId, sender, text, isBuyer }) => {
        console.log('收到消息:', { itemId, sender, text, isBuyer });
        const message = new Message({ itemId, sender, text, isBuyer });
        try {
            const savedMessage = await message.save();
            console.log('消息已保存到数据库:', savedMessage);
            io.to(itemId).emit('receiveMessage', savedMessage);
        } catch (error) {
            console.error('Failed to save message:', error);
            res.status(500).json({ message: 'Failed to save message', error: error.message });
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// 设置 WebSocket
setupWebSocket(server);

// 使用 server 来监听端口
server.listen(5000, () => {
    console.log('Server running on port 5000');
});

// 下架物品的API
app.put('/api/items/:id/delist', async (req, res) => {
    try {
        const item = await Item.findByIdAndUpdate(req.params.id, { isListed: false }, { new: true });
        if (!item) {
            return res.status(404).json({ message: '物品不存在' });
        }
        res.json(item);
    } catch (error) {
        console.error('Failed to delist item:', error);
        res.status(500).json({ message: 'Failed to delist item', error: error.message });
    }
});

// 更新物品上架/下架状态的API
app.put('/api/items/:id/toggle-listing', async (req, res) => {
    console.log('Received toggle-listing request for item:', req.params.id);
    try {
        const item = await Item.findById(req.params.id);
        if (!item) {
            console.log('Item not found:', req.params.id);
            return res.status(404).json({ message: '物品不存在' });
        }
        console.log('Current item status:', item.isListed);
        item.isListed = !item.isListed;
        await item.save();
        console.log('Item status updated:', item);
        res.json(item);
    } catch (error) {
        console.error('Failed to update item status:', error);
        res.status(500).json({ message: 'Failed to update item status', error: error.message });
    }
});

// 添加这个新的路由来获取用户的所有聊天
app.get('/api/user-chats/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        console.log('Fetching chats for user:', userId);
        const messages = await Message.find({
            $or: [
                { sender: userId },
                { receiver: userId }
            ]
        }).sort({ timestamp: 1 });

        console.log('Found messages:', messages);

        // 按物品ID分组消息
        const groupedMessages = messages.reduce((acc, message) => {
            if (!acc[message.itemId]) {
                acc[message.itemId] = [];
            }
            acc[message.itemId].push(message);
            return acc;
        }, {});

        // 获取相关的物品信息
        const itemIds = Object.keys(groupedMessages);
        const items = await Item.find({ _id: { $in: itemIds } });
        const itemMap = items.reduce((acc, item) => {
            acc[item._id.toString()] = item;
            return acc;
        }, {});

        // 将物品信息添加到分组的消息中
        const chatData = Object.entries(groupedMessages).map(([itemId, messages]) => ({
            itemId,
            itemName: itemMap[itemId] ? itemMap[itemId].name : 'Unknown Item',
            messages
        }));

        console.log('Grouped chat data:', chatData);
        res.json(chatData);
    } catch (error) {
        console.error('Failed to get user chats:', error);
        res.status(500).json({ message: 'Failed to get user chats', error: error.message });
    }
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 添加测试路由
app.get('/test', (req, res) => {
    res.send('Server is running');
});

// 在现有路由之后添加
app.post('/api/messages', async (req, res) => {
    try {
        const newMessage = new Message(req.body);
        await newMessage.save();
        res.status(201).json(newMessage);
    } catch (error) {
        console.error('Failed to save message:', error);
        res.status(500).json({ message: 'Failed to save message', error: error.message });
    }
});

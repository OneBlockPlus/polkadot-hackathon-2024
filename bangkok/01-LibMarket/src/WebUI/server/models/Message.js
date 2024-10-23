const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    itemId: String,
    sender: String,
    receiver: String,
    text: String,
    timestamp: { type: Date, default: Date.now },
    isBuyer: Boolean
});

module.exports = mongoose.model('Message', MessageSchema);
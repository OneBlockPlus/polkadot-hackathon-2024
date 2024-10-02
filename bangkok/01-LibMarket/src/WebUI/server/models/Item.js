const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
    name: String,
    price: Number,
    description: String,
    image: String,
    seller: String,
    isListed: { type: Boolean, default: true }
});

module.exports = mongoose.model('Item', ItemSchema);
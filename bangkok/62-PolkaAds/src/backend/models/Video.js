// backend/models/Video.js
const mongoose = require('mongoose');

const ProductAdSchema = new mongoose.Schema({
    _id: String,
    title: {type: String, required: true},
    walletAddress: {type: String, required: true},
    image: {type: String, required: true},
    price: {type: Number, required: true},
    timingStart: {type: Number, required: true}, // in seconds
    timingEnd: {type: Number, required: true}, // in seconds
}, {_id: true});

const VideoSchema = new mongoose.Schema({
    _id: String,
    youtubeUrl: {type: String, required: true, unique: true},
    productAds: [ProductAdSchema],
});

module.exports = mongoose.model('Video', VideoSchema);
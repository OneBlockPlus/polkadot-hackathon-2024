const mongoose = require('mongoose');

// Define the Items schema
const ItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    quantity: { type: Number, required: true },
    size: { type: String, required: false },
});

// Define the Session schema
const CheckoutSessionSchema = new mongoose.Schema({
    sessionId: { type: String, required: true, unique: true },
    network: { type: String, required: true },
    successUrl: { type: String, required: true },
    cancelUrl: { type: String, required: true },
    tokens: { type: [String], required: false },
    items: { type: [ItemSchema], required: true }, // Use ItemSchema for items
    discounts: { type: Object, required: false },
    shippingFees: { type: Number, required: false },
    merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    merchantWallet: { type: String, required: true }, 
    merchantEmail: { type: String, required : true }, 
    collectShippingAddress: { type: Boolean, default : false }, 
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' }, // Session status
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('CheckoutSession', CheckoutSessionSchema);

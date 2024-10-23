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
    txHash: { type: String, required: false },
    tokens: { type: [String], required: false, default : 0 },
    items: { type: [ItemSchema], required: true },
    totalPrice: { type: Number, required: false },  
    discounts: { type: Object, required: false },
    shippingFees: { type: Number, required: false },
    merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    merchantWallet: { type: String, required: true }, 
    merchantEmail: { type: String, required : true }, 
    merchantFirstName: { type: String, required : false }, 
    merchantBusinessName: { type: String, required : false }, 
    collectShippingAddress: { type: Boolean, default : false }, 
    paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' }, // Session status
    durationTime: { type: Date, default: Date.now }, // No auto-deletion
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('CheckoutSession', CheckoutSessionSchema);

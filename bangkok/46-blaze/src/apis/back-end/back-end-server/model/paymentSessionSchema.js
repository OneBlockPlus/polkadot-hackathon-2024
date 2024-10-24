const mongoose = require('mongoose');

const PaymentSessionSchema = new mongoose.Schema({
    sessionId: { type: String, required: true, unique: true },
    paymentLinkId: { type: mongoose.Schema.Types.ObjectId, ref: 'PaymentLink', required: true },
    payerEmail: { type: String },
    payerName: { type: String },
    payerWallet: { type: mongoose.Schema.Types.Mixed },
    payerAddress: { type: mongoose.Schema.Types.Mixed },
    coin: { type: String },
    network: { type: String },
    txHash: { type: String },
    paymentStatus: { type: String, enum: ['pending', 'completed', 'failed', 'expired'], default: 'pending' },
    amount: { type: Number, required: true },
    durationTime: { type: Date, default: Date.now, required: true }, // No auto-deletion
    createdAt: { type: Date, default: Date.now },
   
});

module.exports = mongoose.model('PaymentSession', PaymentSessionSchema);


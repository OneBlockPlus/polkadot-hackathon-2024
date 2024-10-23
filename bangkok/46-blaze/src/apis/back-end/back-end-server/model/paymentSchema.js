const mongoose = require('mongoose');

const PaymentLinkSchema = new mongoose.Schema({
    linkName: { type: String, required: true },
    description: { type: String, required: false },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    paymentType: { type: String, enum: ['fixed', 'open'], required: true },
    amount: { type: Number, required: function() { return this.paymentType === 'fixed'; }},
    supportedTokens: { type: [String], required: false },
    collectEmail: { type: Boolean, default: false },
    collectName: { type: Boolean, default: false },
    collectAddress: { type: Boolean, default: false },
    payementTag: { type: String },
    labelText: { type: String },
    successTxt: { type: String },
    redirectUser: { type: Boolean, default: false },
    redirectUrl: { type: String },
 createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PaymentLink', PaymentLinkSchema);

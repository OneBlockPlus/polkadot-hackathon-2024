// models/merchant.js
import pkg from 'mongoose';
const { Schema, model, models } = pkg;

const MerchantSchema = new Schema({
    relay_id: { type: String, required: true },
    location: { type: String, required: true },
    passcode: { type: String, required: true },
    addr: { type: String, default: undefined },
    status: { type: String, default: 'idle' },
    tx: { type: [String], default: [] }
});

export const Merchant = models.Merchant || model('Merchant', MerchantSchema);
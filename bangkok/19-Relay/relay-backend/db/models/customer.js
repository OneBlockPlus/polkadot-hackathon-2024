import pkg from 'mongoose';
const { Schema, model, models } = pkg;

const CustomerSchema = new Schema({
    relay_id: { type: String, required: true },
    location: { type: String, required: true },
    threshold: { type: Number, required: true },
    sm_addr: { type: String, required: true },
    lg_addr: { type: String, required: true },
    enc_sm_b: { type: String, required: true },
    enc_lg_b: { type: String, required: true },
    status: { type: String, default: 'active' },
    tx: { type: [String], default: [] },
    otp: { type: Number, default: undefined }
});

export const Customer = models.Customer || model("User", CustomerSchema);
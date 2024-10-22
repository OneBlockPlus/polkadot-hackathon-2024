const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  invoiceNumber: {
    type: String,
    required: false,
    unique: false, // Each invoice should have a unique number
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Customer', // Reference to the user model, assuming you have a user model
    required: true,
  },
  items: [{
    description: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    total: {
      type: Number,
      required: false,
      min: 0,
    }
  }],
  subtotal: {
    type: Number,
    required: false,
    min: 0,
  },
  tax: {
    type: Number,
    default: 0,
  },
  txHash: {
    type: String,
  },
  senderWallet: {
    type: String,
  },
  totalAmount: {
    type: Number,
    required: false,
    min: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue', 'failed'], // Different statuses an invoice can have
    default: 'pending',
  },
  dueDate: {
    type: Date,
    required: true,
  },
  issuedDate: {
    type: Date,
    default: Date.now,
  },
  paymentToken: {
    type: String,
    enum: ['USDT', 'USDC', 'APT'], // You can add any method here
    default: 'APT',
  },
  memo: {
    type: String,
    maxlength: 500,
  }
}, { timestamps: true }); // This will automatically add createdAt and updatedAt timestamps

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;

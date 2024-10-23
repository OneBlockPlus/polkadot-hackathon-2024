const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    wallet: {
      type: String,
      required: false,
      unique: false,
    },
    otp: {
      type: Number,
    },
    otpExpires: {
      type: Date,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    firstName: {
      type: String,
      required: false,
    },
    lastName: {
      type: String,
      required: false,
    },
    businessName: {
      type: String,
      required: false,
    },
    brandColor: {
      type: String,
      required: false,
    },
    publicKey: {
      type: String,
      required: false, // Optional since not all users may have keys
    },
    privateKey: {
      type: String,
      required: false, // Same here
    }
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);

module.exports = User;

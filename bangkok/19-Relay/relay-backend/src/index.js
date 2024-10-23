// index.ts
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import dotenv from "dotenv";
import { Customer } from "../db/models/customer.js";
import { Merchant } from "../db/models/merchant.js";
import { connect } from "../db/db.js";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || "supersecretkey";

// MongoDB connection
await connect();

// API Endpoints

// Register customer or merchant
app.post("/api/register", async (req, res) => {
  try {
    if (req.body.role.toLowerCase() == "merchant") {
      // Register a merchant
      const { relay_id, location, passcode } = req.body;
      const hashedPasscode = await bcrypt.hash(passcode, 10);
      const merchant = new Merchant({
        relay_id,
        location,
        passcode: hashedPasscode,
      });
      await merchant.save();
      res.status(201).json({ message: "Merchant registered successfully." });
    } else {
      // Register a customer
      const {
        relay_id,
        location,
        threshold,
        sm_addr,
        lg_addr,
        enc_sm_b,
        enc_lg_b,
      } = req.body;
      const customer = new Customer({
        relay_id,
        location,
        threshold,
        sm_addr,
        lg_addr,
        enc_sm_b,
        enc_lg_b,
      });
      await customer.save();
      res.status(201).json({ message: "Customer registered successfully." });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update merchant after receiving their device
app.post("/api/update", async (req, res) => {
  const { relay_id, addr, passcode } = req.body;

  try {
    const merchant = await Merchant.findOne({ relay_id });
    if (!merchant)
      return res.status(404).json({ message: "Merchant not found." });

    const isPasscodeValid = await bcrypt.compare(passcode, merchant.passcode);
    if (!isPasscodeValid)
      return res.status(403).json({ message: "Invalid passcode." });

    merchant.addr = addr;
    merchant.status = "active";
    await merchant.save();
    res.status(200).json({ message: "Merchant updated successfully." });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Retrieve encrypted seed phrase
app.post("/api/charge", async (req, res) => {
  console.log(req.body);
  const { relay_id, amount } = req.body;

  try {
    const customer = await Customer.findOne({ relay_id });
    if (!customer)
      return res.status(404).json({ message: "Customer not found." });

    const enc_b =
      amount <= customer.threshold ? customer.enc_sm_b : customer.enc_lg_b;

    res.status(200).json({
      enc_b,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Generate OTP
app.post("/api/otp", async (req, res) => {
  const { relay_id } = req.body;

  try {
    const otp = crypto.randomInt(100000, 999999);
    await Customer.updateOne({ relay_id }, { otp });
    res.status(200).json({ message: "OTP generated", otp });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Store transaction hash
app.post("/api/storeTx", async (req, res) => {
  const { from, to, txn } = req.body;

  try {
    const merchant = await Merchant.findOne({ addr: to });
    if (!merchant)
      return res.status(404).json({ message: "Merchant not found." });
    merchant.tx.push(txn);
    await merchant.save();

    const customer = await Customer.findOne({ relay_id: from });
    if (!customer)
      return res.status(404).json({ message: "Customer not found." });
    customer.tx.push(txn);
    await customer.save();

    res.status(200).json({ message: "Transaction stored successfully." });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Authenticate and login user
app.post("/api/login", async (req, res) => {
  const { role, relay_id, passcode } = req.body;

  try {
    if (role.toLowerCase() == "merchant") {
      const merchant = await Merchant.findOne({ relay_id });
      if (!merchant)
        return res.status(404).json({ message: "Merchant not found." });

      const isPasscodeValid = await bcrypt.compare(passcode, merchant.passcode);
      if (!isPasscodeValid)
        return res.status(403).json({ message: "Invalid passcode." });

      const token = jwt.sign({ relay_id, isMerchant: true }, SECRET_KEY);
      res
        .status(200)
        .json({ message: "Merchant login successful.", token, merchant });
    } else {
      const customer = await Customer.findOne({ relay_id });
      if (!customer)
        return res.status(404).json({ message: "Customer not found." });
      // As long as a customer can connect the wallet with a correct address, we can assume the customer is authenticated
      // TODO: need to add middleware to guard who can access this route
      res.status(200).json({ message: "Customer login successful.", customer });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/api/test", (req, res) => {
  res.status(200).json({ message: "Hello, Raspberry Pi." })
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

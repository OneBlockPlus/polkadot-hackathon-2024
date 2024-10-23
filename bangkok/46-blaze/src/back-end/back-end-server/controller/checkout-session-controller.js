const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');
const User  =  require("../model/UserModel");
const { checkTxStatus } = require('../lib/CheckTxStatus');
const { sendMail2 } = require('../helper/sendEmail');
const CheckoutSession  =  require("../model/checkout-session");
const { validateSession, monitorTransactionStatus } = require('../helper/checkoutSessionUtilities');
const { ApiPromise, WsProvider } = require('@polkadot/api')

const provider = new WsProvider('wss://paseo.rpc.amforc.com'); // Use a Polkadot network, replace with your network's WS endpoint


const testTxValdator  = asyncHandler ( async (req, res)  =>  {
     const {txHash}  = req.body
      console.log("tx hash", txHash)
      if(!txHash){
        throw new Error("no transaction hash")
      }
})

const createCheckoutSession = asyncHandler(async (req, res) => {
    // Extract the public key from the request headers
  
    const publicKey = req.headers['authorization']; // Use a custom header for the public key
    if (!publicKey) {
      return res.status(400).json({ message: 'Authorization header is required' });
  }
  
  // Split the header to get the token and remove the 'Bearer ' prefix
  const tokenKey = publicKey.split(' ')[1]; // This will give you the token part
    console.log("bublic header", publicKey)
    const {
        network,
        success_url,
        cancel_url,
        tokens,
        items,
        discounts,
        shipping_fees
    } = req.body;
  
    // Validate required fields
    if (!publicKey || !network || !success_url || !cancel_url || !items || items.length === 0) {
        return res.status(400).json({ message: 'Public key, network, success_url, cancel_url, and items are required.' });
    }
  
    // Find the merchant by their public key
    const merchant = await User.findOne({ publicKey: tokenKey });
    if (!merchant) {
        return res.status(404).json({ message: 'Merchant not found.' });
    }
  
    // Generate a unique session ID
    const sessionId = uuidv4();
    // Create a new session in the database
    const newSession = new CheckoutSession({
        sessionId,
        network,
        successUrl: success_url,
        cancelUrl: cancel_url,
        tokens,
        items,
        discounts,
        shippingFees: shipping_fees,
        merchantId: merchant._id, // Save the merchant's ID
        merchantWallet: merchant.wallet, // Save the merchant's wallet address
        merchantEmail : merchant.emails,
        status: 'pending', // Set initial session status
        createdAt: new Date(),
    });
  
    await newSession.save();
  
    // Return the session ID and merchant wallet address if needed
    res.status(201).json({
        message: 'Checkout session created successfully.',
        sessionId,
       // merchantWallet: merchant.wallet // Include the merchant's wallet address
    });
  });

   // @desc    Handle get session data
// @route   GET /api/pay/checkout-session/:sessionId
// @access  Public
const getSessionMetadata = asyncHandler(async (req, res) => {
    const { sessionId } = req.params; 
  
    // Find the session by ID
    const session = await CheckoutSession.findOne({ sessionId })   //.populate('merchantId'); // Optionally populate merchant details
  
    if (!session) {
        return res.status(404).json({ message: 'Session not found.' });
    }
  
    // Return session metadata
    res.status(200).json({
        session,
    });
  });



    // @desc    Handle checkout and payment
// @route   POST /api/payment/checkout/:sessionId
// @access  Public

const handleCheckout = asyncHandler(async (req, res) => {
    const io = req.app.get('socketio');
    const { sessionId } = req.params;
    const { transactionHash, shippingAddress } = req.body;
  
    const paymentSession = await CheckoutSession.findOne({ sessionId })     ///.populate('paymentLinkId');
   // const user = await User.findById(paymentSession.paymentLinkId.userId);
       const email = paymentSession.merchantEmail
    validateSession(shippingAddress);
  
    if (!transactionHash) {
      io.emit('paymentStatus', { status: "FAILED", sessionId, message : "No transaction hash provided" });
      res.status(400).json({ message: "Please provide transaction hash" });
      throw new Error("No transaction hash provided, please check blockchain status");
    }
  
   
  
    // Start monitoring transaction status
    monitorTransactionStatus(transactionHash, paymentSession, io, email);
  
    res.status(200).json({ message: 'Payment processing initiated' });
  });



  ///  TESTING MONITORING TXS

  const monitorTransactionStatus2 = async (transactionHash, io,) => {
    const interval = setInterval(async () => {
      // Check transaction status
      const txResult = await checkTxStatus(transactionHash);
  
      if (txResult === 'SUCCESS') {
        // Handle successful transaction - update the status to completed
     console.log("transction success", transactionHash)
    console.log("transaction results", txResult)
        // Emit success event
        io.emit('paymentStatus', {
          status: "COMPLETED",
          sessionId: "test session",
          txHash: transactionHash,
          amount: "test amount",
        });
  
        clearInterval(interval);  // Stop monitoring when transaction is successful
      } else if (txResult === 'FAILED') {
          console.log("transaction fauled", txResult)
        io.emit('paymentStatus', { status: "FAILED" });
        clearInterval(interval);
      } else if (new Date() > paymentSession.durationTime && paymentSession.paymentStatus === "pending") {
        // Handle expired session
        console.log("expired")
        io.emit('paymentStatus', { status: "EXPIRED", sessionId: paymentSession.sessionId });
        clearInterval(interval);
      }
    }, 30000); // Check every 30 seconds
  };

    const handletestTransactions =   asyncHandler( async  (req, res)  =>  {
      const io = req.app.get('socketio');
     const  {transactionHash}  = req.body
       await monitorTransactionStatus2(transactionHash, io)

       res.send("testing transaction")
    })

  module.exports = {
    createCheckoutSession,
    getSessionMetadata,
    handleCheckout,
    handletestTransactions
  }


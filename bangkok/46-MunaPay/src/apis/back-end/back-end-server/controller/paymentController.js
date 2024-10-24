const asyncHandler = require('express-async-handler');
const PaymentLink = require('../model/paymentSchema');
const PaymentSession  =  require("../model/paymentSessionSchema")
const { v4: uuidv4 } = require('uuid');
const User  =  require("../model/UserModel");
const { checkTxStatus } = require('../lib/CheckTxStatus');
const { sendEmail, sendMail2 } = require('../helper/sendEmail');
const Invoice = require('../model/invoice-schema');
const CheckoutSession  =  require("../model/checkout-session")


// @desc    Create payment link
// @route   POST /api/payment/create-link
// @access  Private
const createPaymentLink = asyncHandler(async (req, res) => {
  const {linkName,  paymentType,
     amount, collectEmail,
      collectName, collectAddress, 
       supportedTokens, userId,
      paymentTag, labelText,
       successTxt,
       redirectUser,
       redirectUrl,
       description
    } = req.body;
  //const userId = req.user._id;

  if (paymentType === 'fixed' && (!amount || amount <= 0)) {
    res.status(400);
    throw new Error('Invalid amount for fixed payment type');
  }


  //  NO  USING  CUSTOM ID  FOR LINK 

  //const  paymentLinkId = uuidv4();

  const paymentLink = new PaymentLink({
    linkName,
    userId,
    paymentType,
    amount,
    supportedTokens,
    collectEmail,
    collectAddress,
    collectName,
    labelText,
    redirectUrl,
    redirectUser,
    successTxt,
    paymentTag,
    description


  
  });

  await paymentLink.save();

  res.status(201).json({
    message: 'Payment link created',
    paymentLink: `https://yourapp.com/pay/${paymentLink._id}`,
  });
});




// @desc    Initiate transaction session
// @route   POST /api/payment/initiate-session
// @access  Public
const initiatePaymentSession = asyncHandler(async (req, res) => {
  const io = req.app.get('socketio');

  const {sessionId}  = req.params

  const paymentSession = await PaymentSession.findOne({ sessionId }).populate('paymentLinkId');

    if(! paymentSession){
      res.status(400).json({message : "no session found"})

      throw new Error("No session found")
    }

    io.emit('paymentStatus', {
      status : "PENDING",
      sessionId : sessionId
    });


  res.status(201).json({
    message: 'Payment session initiated',
    sessionId,
  });
});


// @desc    Generate payment session ID
// @route   GET /api/payment/session/:linkId
// @access  Public
const generateSessionId = asyncHandler(async (req, res) => {
    const { linkId } = req.params;
    const  {amount, coin , network}  = req.body

      console.log("the amount", amount)
  
    const paymentLink = await PaymentLink.findById(linkId);
  
    if (!paymentLink) {
      res.status(404);
      throw new Error('Payment link not found');
    }

    if (paymentLink.paymentType === 'fixed' && amount !== paymentLink.amount) {
      res.status(400);
      throw new Error('Invalid amount for fixed payment type');
    }

    if (paymentLink.paymentType === 'fixed' &&  !amount) {
      res.status(400);
      throw new Error('please  add the  required  amount');
    }

    if (paymentLink.paymentType === 'open' &&  !amount) {
      res.status(400);
      throw new Error('PLease add amount fisr  before prcceding ');
    }
  
    const sessionId = uuidv4();
    const expTime  = new Date(Date.now() + 30 * 60000) // 30 minutes expiration
  
    const paymentSession = new PaymentSession({
      amount,
      coin,
      network,
      paymentLinkId: paymentLink._id,
      sessionId,
      status: 'pending',
      durationTime: expTime
    });
  
    await paymentSession.save();
  
    res.json({sessionId: sessionId, expiresAt : expTime });
  });

  // @desc    Generate payment session ID
// @route   GET /api/payment/session/:linkId
// @access  Public
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


//   Utilities  functions

const validateSession = (paymentSession, payerName, payerEmail, payerAddress) => {
  if (!paymentSession) {
    throw new Error('Payment session not found');
  }

  if (paymentSession.paymentLinkId.collectEmail && !payerEmail) {
    throw new Error("Email is required, please add your email address");
  }

  if (paymentSession.paymentLinkId.collectName && !payerName) {
    throw new Error("Name is required, please add your name");
  }

  if (paymentSession.paymentLinkId.collectAddress && !payerAddress) {
    throw new Error("Address is required, please add your address");
  }
};


//  send  payment notification

const sendPaymentNotification = async (user, paymentSession, txResult) => {
  const OTP_TEMPLATE_UUID = "7e201329-33cf-49cd-b879-69255081bd6f";
  const recipients = [{ email: user.email }];

  await sendMail2(recipients, OTP_TEMPLATE_UUID, {
    amount: paymentSession.amount,
    currency: "HBAR",
    transaction_id: paymentSession.sessionId,
    payment_link: paymentSession.paymentLinkId,
    receiver_wallet: user.wallet,
  });
};

//  Transcation polling

const monitorTransactionStatus = async (transactionHash, paymentSession, io, user) => {
  const interval = setInterval(async () => {
    // Check transaction status
    const txResult = await checkTxStatus(transactionHash);

    if (txResult === 'SUCCESS') {
      // Handle successful transaction - update the status to completed
      await PaymentSession.findOneAndUpdate(
        { sessionId: paymentSession.sessionId },
        { paymentStatus: "completed", txHash : transactionHash },  // Update to "completed" only on success
        { new: true }
      );

      // Send payment success email
      await sendPaymentNotification(user, paymentSession);

      // Emit success event
      io.emit('paymentStatus', {
        status: "COMPLETED",
        sessionId: paymentSession.sessionId,
        txHash: transactionHash,
        amount: paymentSession.amount,
      });

      clearInterval(interval);  // Stop monitoring when transaction is successful
    } else if (txResult === 'FAILED') {
      // Handle failed transaction
      await PaymentSession.findOneAndUpdate(
        { sessionId: paymentSession.sessionId },
        { paymentStatus: "failed" , txHash : transactionHash},  // Mark as "failed"
        { new: true }
      );

      io.emit('paymentStatus', { status: "FAILED", sessionId: paymentSession.sessionId });
      clearInterval(interval);
    } else if (new Date() > paymentSession.durationTime && paymentSession.paymentStatus === "pending") {
      // Handle expired session
      await PaymentSession.findOneAndUpdate(
        { sessionId: paymentSession.sessionId },
        { paymentStatus: "expired" },  // Mark as "expired" if timed out
        { new: true }
      );

      io.emit('paymentStatus', { status: "EXPIRED", sessionId: paymentSession.sessionId });
      clearInterval(interval);
    }
  }, 30000); // Check every 30 seconds
};



  // @desc    Handle checkout and payment
// @route   POST /api/payment/checkout/:sessionId
// @access  Public

const handleCheckout = asyncHandler(async (req, res) => {
  const io = req.app.get('socketio');
  const { sessionId } = req.params;
  const { transactionHash, payerName, payerEmail, payerAddress } = req.body;

  const paymentSession = await PaymentSession.findOne({ sessionId }).populate('paymentLinkId');
  const user = await User.findById(paymentSession.paymentLinkId.userId);

  validateSession(paymentSession, payerName, payerEmail, payerAddress);

  if (!transactionHash) {
    io.emit('paymentStatus', { status: "FAILED", sessionId });
    res.status(400).json({ message: "Please provide transaction hash" });
    throw new Error("No transaction hash provided, please check blockchain status");
  }

 

  // Start monitoring transaction status
   await monitorTransactionStatus(transactionHash, paymentSession, io, user);

  res.status(200).json({ message: 'Payment processing initiated' });
});

 // @desc    Handle checkout-session 
// @route   POST /api/pay/checkout-session/:sessionId
// @access  Public


 const  getPyament  =  asyncHandler (  async (req, res)  =>  {
 const {linkId}  = req.params

     // Find the PaymentLink document by ID
     const paymentLink = await PaymentLink.findById(linkId);

         // If the link is not found, return a 404 response
         if (!paymentLink) {
          return res.status(404).json({ message: 'Payment link not found' });
          }

        // Return the payment link details
        res.status(200).json({
          paymentLink
        });

   
 })


 const  getPaymentLinkSessions  =  asyncHandler (  async (req, res)  =>  {

  const {linkId}  = req.params

   // Find the PaymentLink document by ID
   const paymentLink = await PaymentLink.findById(linkId);

       // If the link is not found, return a 404 response
       if (!paymentLink) {
        return res.status(404).json({ message: 'Payment link not found' });
        }

         // Find all PaymentSessions associated with this PaymentLink
const paymentSessions = await PaymentSession.find({ paymentLinkId: linkId });

      // Return the payment link details
      res.status(200).json({
        paymentLink,
        paymentSessions
      });

 
})


 const  getSession  =  asyncHandler (  async (req, res)  =>  {

  const {sessionId}  = req.params

   // Find the Payment session document by ID
   const paymentSession = await PaymentSession.findOne({sessionId});

        // If the link is not found, return a 404 response
        if (!paymentSession) {
          return res.status(404).json({ message: 'Payment  session not found' });
         
  
      }
   // FIND_PAYMENT RECIEVER

   const reciever =  await  PaymentLink.findById(paymentSession.paymentLinkId).populate("userId")

      //console.log("the printed info", reciever)

  

      // Return the payment link details
      res.status(200).json(
        {
          session : paymentSession,
           reciever : reciever
        }
      );

 
})

const getPaymensByUserId = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  try {
    // Step 1: Find all PaymentLinks created by this user
    const paymentLinks = await PaymentLink.find({ userId });

    // If no payment links are found, return an empty array
    if (paymentLinks.length === 0) {
      return res.status(200).json({ message: 'No payment links found for this user.', paymentSessions: [] });
    }

    // Extract all link IDs
    const linkIds = paymentLinks.map(link => link._id);

    // Step 2: Find all PaymentSessions associated with the found PaymentLinks
    const payments = await PaymentSession.find({ paymentLinkId: { $in: linkIds } }).populate("paymentLinkId");

    // Return the payment sessions
    res.status(200).json({ payments });

  } catch (error) {
    // Handle any errors
    res.status(500).json({ message: error.message });
  }
});

 

// Controller function to get payment links by user ID
const getPaymentLinksByUserId = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  try {
    // Fetch all payment links created by the specified user
    const paymentLinks = await PaymentLink.find({ userId });

    // If no payment links are found, return an empty array
    if (! paymentLinks) {
      return res.status(404).json({ message: 'No payment links found for this user.' });
    }
        // Fetch associated payment sessions for each payment link
        const paymentLinksWithSessions = await Promise.all(
          paymentLinks.map(async (link) => {
            const sessions = await PaymentSession.find({ paymentLinkId: link._id });
            return {
              ...link._doc, // Spread the payment link document
              sessions,    // Add the associated payment sessions
            };
          })
        );

    // Return the payment links
    res.status(200).json({ paymentLinks : paymentLinksWithSessions });
  } catch (error) {
    // Handle any errors that may occur
    res.status(500).json({ message: error.message });
  }
});

// Controller function to get payment links by user ID
const getInvoicesByUserId = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  try {
    // Fetch all payment links created by the specified user
    const  invoices = await Invoice.find({ userId }).populate("customer");

    // If no payment links are found, return an empty array
    if (! invoices) {
      return res.status(404).json({ message: 'No invoices found for this user.' });
    } 

    // Return the payment links
    res.status(200).send(invoices);
  } catch (error) {
    // Handle any errors that may occur
    res.status(500).json({ message: error.message });
  }
});






module.exports = { createPaymentLink,  generateSessionId,
   handleCheckout, 
  getPyament, getSession,
   getPaymentLinkSessions,
   getPaymensByUserId,
   getPaymentLinksByUserId,
   initiatePaymentSession,
   getInvoicesByUserId,
  }; 

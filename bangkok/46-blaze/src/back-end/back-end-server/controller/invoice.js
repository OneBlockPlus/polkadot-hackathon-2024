const asyncHandler =  require("express-async-handler")
const  Invoice  =  require("../model/invoice-schema")
const Customer =  require("../model/customer-schema")
const { checkTxStatus } = require('../lib/CheckTxStatus');
const {Network,Aptos, AptosConfig, convertAmountFromHumanReadableToOnChain}   =  require("@aptos-labs/ts-sdk");
const { sendMail2 } = require("../helper/sendEmail");



 // Setup the client
 const config = new AptosConfig({ network: Network.TESTNET });
 const aptos = new Aptos(config);


// Helper function to generate unique invoice number
const generateInvoiceNumber = async () => {
    const lastInvoice = await Invoice.findOne().sort({ createdAt: -1 });
    const lastInvoiceNumber = lastInvoice ? parseInt(lastInvoice.invoiceNumber, 10) : 0;
    const nextInvoiceNumber = lastInvoiceNumber + 1;
    return String(nextInvoiceNumber).padStart(6, '0'); // Pads the number with zeros (e.g., 000001)
  };
  
  // Helper function to calculate due date based on user's selection
  const calculateDueDate = (selection) => {
    const now = new Date();
    switch (selection) {
      case 'tomorrow':
        return new Date(now.setDate(now.getDate() + 1));
      case 'next_week':
        return new Date(now.setDate(now.getDate() + 7));
      case 'next_month':
        return new Date(now.setMonth(now.getMonth() + 1));
      default:
        return now; // If no valid selection, return current date
    }
  };
  
  // Controller function to create an invoice
  const createInvoice = async (req, res) => {
    try {
      const {userId,  customer, items, dueDate, paymentMethod, memo, tax } = req.body;
  
      // Validate required fields
      if (!userId || !customer  || !items || ! dueDate) {
        return res.status(400).json({ message: 'All required fields must be filled.' });
      }
  
      //  Get  Customer

      const customerEmail  =  await Customer.findById(customer)
      console.log("cutsomer", customerEmail)
      // Generate unique invoice number
      const invoiceNumber = await generateInvoiceNumber();
  
      // Calculate subtotal and total amounts
      const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
      //const tax = subtotal * 0.15; // Example: 15% tax, adjust as per your need
      const totalAmount = subtotal + tax;
  

         console.log("the  selected due date", dueDate)
      // Generate due date based on the user's selection (e.g., tomorrow, next week, etc.)
      const dueDateSelection = calculateDueDate(dueDate);
  
      // Create the invoice
      const newInvoice = new Invoice({
        userId,
        invoiceNumber,
         customer,
        items,
        subtotal,
        tax,
        totalAmount,
        status: 'pending', // Default status for new invoices
        dueDate : dueDateSelection,
        paymentMethod,
        memo,
      });
  
      // Save the invoice to the database
      await newInvoice.save();
      //  OTP  EMAIL TEMPLATE
      console.log("receipient", customerEmail?.customerEmail)
   
        const  OTP_TEMPLATE_UUID  = "7e201329-33cf-49cd-b879-69255081bd6f"
      const recipients = [
        {
          email: customerEmail.customerEmail,
        }
      ];
       
      // SEND  AN INVOICE

      await sendMail2(recipients, OTP_TEMPLATE_UUID, {
        "amount": "1",
        "currency": "HBAR",
        "transaction_id": "Just testing invoice automatin",
        "payment_link": "This is testing link",
        "receiver_wallet": "No wallet bro",
       });

      // Send success response
      return res.status(201).json({
        message: 'Invoice created successfully!',
        invoice: newInvoice,
      });
    } catch (error) {
      console.error('Error creating invoice:', error);
      return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
  };

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

  // Controller function to get payment links by user ID
  const getInvoiceById = asyncHandler(async (req, res) => {
    const { invoiceId } = req.params;
  
    try {
      // Fetch all payment links created by the specified user
      const  invoice = await Invoice.findById(invoiceId).populate("customer").populate("userId");
  
      // If no payment links are found, return an empty array
      if (! invoice) {
        return res.status(404).json({ message: 'No invoices found for this user.' });
      }

       
  
      // Return the invoice
      res.status(200).json({invoice});
    } catch (error) {
      // Handle any errors that may occur
      res.status(500).json({ message: error.message });
    }
  });


  // @desc    Initiate transaction session
// @route   POST /api/payment/initiate-session
// @access  Public
const initiatePaymentSession = asyncHandler(async (req, res) => {
  const io = req.app.get('socketio');

  const {invoiceId}  = req.params

  const invoice = await Invoice.findById( invoiceId );

    if(! invoice){
      res.status(400).json({message : "no session found"})

      throw new Error("No session found")
    }

    io.emit('invoiceStatus', {
      status : "PENDING",
      invoiceId : invoiceId
    });


  res.status(201).json({
    message: 'invoice session initiated',
    invoiceId,
  });
});





// @desc    Initiate blockchain tx
// @route   POST /api/payment/invoice/buildtx
// @access  Public
const handleBuildTx = asyncHandler(async (req, res) => {
  const { invoiceId } = req.params;
  const { sender } = req.body;
  
  const invoice = await Invoice.findById(invoiceId).populate("userId");
  if (!sender || !invoice) {
    res.status(404).json({ message: "no user or sender wallet address" });
    throw new Error("No sender and no user");
  }

  // RECIEVER PLACEHOLDER
  const placeHolder = "0x09d29f0ec5b03fc73b59e35deb80356cde17b13b8db94ded34fc8130dc1da1d9";
  
  // Build the transaction
  const transaction = await aptos.transaction.build.simple({
    sender: sender,
    data: {
      // The Move entry-function
      function: "0x1::aptos_account::transfer",
      functionArguments: [placeHolder, convertAmountFromHumanReadableToOnChain(0.3, 8)],
    },
  });

  console.log("transactions", transaction);

  // Convert BigInt fields in the transaction to strings before sending the response
  const transactionStringified = JSON.parse(
    JSON.stringify(transaction, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );

  res.status(200).send(transactionStringified);
});

// @desc    Handle checkout and payment
// @route   POST /api/payment/checkout/:sessionId
// @access  Public
const handleCheckout = asyncHandler(async (req, res) => {
const io = req.app.get('socketio');
const { invoiceId } = req.params;
const {
  txHash,
  senderWallet
   } = req.body;


const invoice = await Invoice.findById(invoiceId).populate("userId");

if (!invoice) {
  res.status(404);
  throw new Error('Payment session not found');
}


if(! txHash){
  io.emit('invoiceStatus', {
    status : "FAILED",
    invoiceId : invoiceId
  });
  res.status(400).json({message :  "Please provide transaction hash"})
  throw  new Error("no transaction hash provided  please check blockchain status")
 
}

 // const  reciever  =  await User.findById(paymentSession.paymentLinkId.userId)

 /// const user = await User.findById(paymentSession.paymentLinkId.userId);

  



     // UPDATE_USER_DETAILS_AND_TX_STATUS

       // Find and update the PaymentSession document
       const updatedInvoice = await Invoice.findByIdAndUpdate(
        invoiceId,
        {    status : "PENDING", txHash : txHash },
        { new: true } // Return the updated document
    );


     // console.log("updated payment  info and status", updatedPaymentSession)



// Monitor transaction status
const interval = setInterval(async () => {
   
     const  txResult  =  await  checkTxStatus(txHash)
    console.log("the result status",  txResult)
    console.log("transaction hash", txHash)

  if (txResult === 'SUCCESS') {
   
    

    // Notify user via email

    const  OTP_TEMPLATE_UUID  = "7e201329-33cf-49cd-b879-69255081bd6f"

    const recipients = [
     {
       email: "kabuguabdul2@gmail.com",
     }
   ];
 
   /*await sendMail2(recipients, OTP_TEMPLATE_UUID, {
    "amount": paymentSession.amount,
    "currency": "HBAR",
    "transaction_id": paymentSession.sessionId,
    "payment_link": paymentSession.paymentLinkId,
    "receiver_wallet": "my_wallet",
   });*/

  // UPDATE_USER_DETAILS_AND_TX_STATUS

       // Find and update the PaymentSession document
       const updatedInvoice = await Invoice.findByIdAndUpdate(
        invoiceId,
        {    status : "paid", txHash, senderWallet },
        { new: true } // Return the updated document
    );


      //console.log("updated payment  info and status", updatedPaymentSession)
      clearInterval(interval);

    io.emit('invoiceStatus', {
      status :  "COMPLETED",
       invoiceId : invoiceId,
       txHash : txHash,
       amount :  invoice.subtotal,
       sender : senderWallet
    });

    // Notify user via UI (e.g., via WebSocket or an update endpoint)
    // ... your notification logic here ...
  } else if (txResult === 'FAILED') { 

          // UPDATE_USER_DETAILS_AND_TX_STATUS

          // Find and update the PaymentSession document
          const updatedInvoice = await Invoice.findByIdAndUpdate(
            invoiceId,
            {    status : "failed", txHash : txHash },
            { new: true } // Return the updated document
        );

    clearInterval(interval);
    // Notify user via UI (e.g., via WebSocket or an update endpoint)
    // ... your notification logic here ...
    io.emit('invoiceStatus', {
      status : "FAILED",
      invoiceId : invoiceId,
      txHash : txHash,
      amount :  invoice.subtotal,
      sender : senderWallet
    });
  }
}, 30000); // Check every 30 seconds  */


//  console.log("payment session", paymentSession)


res.status(200).json({ message: 'Payment processing initiated' });
});


const getCustomerById = asyncHandler (async (req, res)  =>  {
   const customer  =  await Customer.findById("66deac9be3e025554a07c0ec")
   res.status(200).json({customer})
})
  
  module.exports = {
    createInvoice,
    getInvoicesByUserId,
    getInvoiceById,
    handleCheckout,
    initiatePaymentSession,
    handleBuildTx,
    getCustomerById
  };

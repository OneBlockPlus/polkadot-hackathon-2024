

const { checkTxStatus } = require("../lib/CheckTxStatus");
const CheckoutSession = require("../model/checkout-session");
const { sendMail2 } = require("./sendEmail");


const validateSession = (paymentSession, shippingAddress) => {
    if (!paymentSession) {
      throw new Error('Payment session not found');
    }
  
    if (paymentSession?.collectShippingAddress && ! shippingAddress ) {
      throw new Error("shipping address is required, please add shipping address");
    }
  };
  
  
  //  send  payment notification
  
  const sendPaymentNotification = async (email, paymentSession, txResult) => {
    const OTP_TEMPLATE_UUID = "7e201329-33cf-49cd-b879-69255081bd6f";
    const recipients = [{ email: email }];
  
    await sendMail2(recipients, OTP_TEMPLATE_UUID, {
      amount: paymentSession.amount,
      currency: "HBAR",
      transaction_id: paymentSession.sessionId,
      payment_link: paymentSession.paymentLinkId,
      receiver_wallet: "wallet later",
    });
  };
  
  //  Transcation polling
  
  const monitorTransactionStatus = async (transactionHash, paymentSession, io, email) => {
    const interval = setInterval(async () => {
      // Check transaction status
      const txResult = await checkTxStatus(transactionHash);
  
      if (txResult === 'SUCCESS') {
        // Handle successful transaction - update the status to completed
        await CheckoutSession.findOneAndUpdate(
          { sessionId: paymentSession.sessionId },
          { paymentStatus: "completed", txHash : transactionHash },  // Update to "completed" only on success
          { new: true }
        );
  
        // Send payment success email
        await sendPaymentNotification(email, paymentSession);
  
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
        await CheckoutSession.findOneAndUpdate(
          { sessionId: paymentSession.sessionId },
          { paymentStatus: "failed" },  // Mark as "failed"
          { new: true }
        );
  
        io.emit('paymentStatus', { status: "FAILED", sessionId: paymentSession.sessionId });
        clearInterval(interval);
      } else if (new Date() > paymentSession.durationTime && paymentSession.paymentStatus === "pending") {
        // Handle expired session
        await CheckoutSession.findOneAndUpdate(
          { sessionId: paymentSession.sessionId },
          { paymentStatus: "expired" },  // Mark as "expired" if timed out
          { new: true }
        );
  
        io.emit('paymentStatus', { status: "EXPIRED", sessionId: paymentSession.sessionId });
        clearInterval(interval);
      }
    }, 30000); // Check every 30 seconds
  };

  module.exports = {validateSession, monitorTransactionStatus}
  
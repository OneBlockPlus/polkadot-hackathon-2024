const env = require("dotenv").config();

exports.constants = {
    VALIDATION_ERROR : 400,
    UN_AUTHORISED : 401,
    FORBIDDEN : 403,
    NOT_FOUND : 404,
    SERVER_ERROR : 500
};

 exports.ACCESS_TOKEN_SECRET =  process.env.ACCESS_TOKEN_SECRET
 exports.EMAIL_HOST =  process.env.EMAIL_HOST
 exports.EMAIL_PORT =  process.env.EMAIL_PORT
 exports.EMAIL_USER =  process.env.EMAIL_USER
 exports.EMAIL_PASS =  process.env.EMAIL_PASS
 exports.EMAIL_FROM =  process.env.EMAIL_FROM
exports.MOONBASE_ALPHA  = "https://moonbase.public.curie.radiumblock.co/http"
exports.MOONRIVER  = "https://moonriver.public.blastapi.io"
exports.MOONBEAM  = "https://moonbeam.public.blastapi.io"








 
// Socket.io connection handler
/*io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('joinSession', async (sessionId) => {
    socket.join(sessionId);

    const paymentSession = await PaymentSession.findOne({ sessionId }).populate('linkId');
    if (!paymentSession) {
      socket.emit('error', 'Payment session not found');
      return;
    }

    const paymentLink = paymentSession.linkId;
    const user = await User.findById(paymentLink.userId);
    if (!user) {
      socket.emit('error', 'User not found');
      return;
    }

    const interval = setInterval(async () => {
      const status = await checkTransactionStatus(paymentSession.transactionHash);

      if (status === 'confirmed') {
        paymentSession.status = 'paid';
        await paymentSession.save();

        clearInterval(interval);

        await sendEmail(
          user.email,
          'Payment Confirmed',
          `Your payment of ${paymentSession.amount} has been confirmed and sent to your wallet ${user.wallet}.`
        );

        io.to(sessionId).emit('paymentStatus', 'paid');
      } else if (status === 'failed') {
        paymentSession.status = 'failed';
        await paymentSession.save();

        clearInterval(interval);

        await sendEmail(
          user.email,
          'Payment Failed',
          `Your payment of ${paymentSession.amount} has failed. Please try again.`
        );

        io.to(sessionId).emit('paymentStatus', 'failed');
      }
    }, 30000); // Check every 30 seconds

    socket.on('disconnect', () => {
      clearInterval(interval);
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});*/

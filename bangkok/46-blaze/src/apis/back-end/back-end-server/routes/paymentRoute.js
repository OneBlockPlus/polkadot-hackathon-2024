const express = require("express");
const { createPaymentLink, generateSessionId, handleCheckout, getPyament, getSession, getPaymentLinkSessions, getPaymensByUserId, initiatePaymentSession } = require("../controller/paymentController");
const { createCheckoutSession, getSessionMetadata, handletestTransactions, handleSessionCheckout } = require("../controller/checkout-session-controller");


const router =  express.Router();

router.route("/create-link").post(createPaymentLink)
router.route("/create-session/:linkId").post(generateSessionId)
router.route("/check-out/:sessionId").post(handleCheckout)
router.route("/initiate-payment/:sessionId").post(initiatePaymentSession)
router.route("/link/:linkId").get(getPyament)
router.route("/session/:sessionId").get(getSession)
router.route("/link-details/:linkId").get(getPaymentLinkSessions)
router.route("/payments/:userId").get(getPaymensByUserId)
router.route('/checkout-session').post(createCheckoutSession)
router.route("/checkout-session/:sessionId").get(getSessionMetadata)
router.route("/checkout-session/:sessionId").post(handleSessionCheckout)
router.route("/test-tx-checker").post(handletestTransactions)



module.exports = router

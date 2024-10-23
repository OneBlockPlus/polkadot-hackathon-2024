const express =  require("express")
const { createInvoice, getInvoicesByUserId, getInvoiceById, initiatePaymentSession, handleCheckout, handleBuildTx, getCustomerById } = require("../controller/invoice")


 const  router =  express.Router()

 router.route("/create-invoice").post(createInvoice)
 router.route("/:userId/invoices").get(getInvoicesByUserId)
 router.route("/get-invoice/:invoiceId").get(getInvoiceById)
 router.route("/initiate-payment/:invoiceId").post(initiatePaymentSession)
 router.route("/check-out/:invoiceId").post(handleCheckout)
 router.route("/build-tx/:invoiceId").post(handleBuildTx)
 router.route("/get-customer").get(getCustomerById)






 module.exports =   router
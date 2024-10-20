const express =  require("express")
const { createCustomer, getUserCustomers } = require("../controller/customer")

const router  =  express.Router()

router.route("/add-customer").post(createCustomer)
router.route("/get-customers/:userId").get(getUserCustomers)

module.exports =  router
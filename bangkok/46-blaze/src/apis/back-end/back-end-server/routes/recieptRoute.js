const  express =  require("express")
const { handleSendReciept } = require("../controller/recieptConrller")


 const  router  =  express.Router()

   router.route("/send-reciept").post(handleSendReciept)

  module.exports = router
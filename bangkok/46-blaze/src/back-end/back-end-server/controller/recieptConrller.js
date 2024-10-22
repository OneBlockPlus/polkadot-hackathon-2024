const asyncHandler = require("express-async-handler")
const {sendEmail, sendMail2} = require("../helper/sendEmail")


  const  handleSendReciept = asyncHandler(   async (req, res)  =>  {

    const {to, amount, link, reciever}  =  req.body

      if(! to){
        res.status(400).json({"message" : "No email was provided"})
        throw new Error("Please  add recipient email")
      }

  const  TEMPLATE_UUID  = `32149740-7f2d-49b1-981a-1a3ebea88c22`

        const recipient  = [
   {
    email : to
   }
        ]

        const  variables = {
          "amount": amount || "test",
          "receiver_wallet": reciever  || "test",
          "payment_link": link || "test",
        }
     await  sendMail2(recipient, TEMPLATE_UUID, variables )


      res.status(201).json({message : "sent email"})

  })

  module.exports  =  {handleSendReciept}

  
const asyncHandler  =  require("express-async-handler")
const Customer  =  require("../model/customer-schema")
const createCustomer =   asyncHandler (async (req, res)   =>  {
  //  const {userId}  =  req.params
    const {
        userId,
        customerName,
        customerEmail,
        organizationName,
        customerPhoneNumber,
        customerPhoneCode,
        customerCountry,
        customerAddressLine1,
        customerAddressLine2,
        customerCity,
        customerState,
        customerZipCode,
        customerTaxId
    }  = req.body

    if(! customerName || ! customerEmail || ! userId){
    return res.status(400).json({ message: 'All required fields must be filled.' });

    }

    const newCustomer = new Customer({
        userId,
        customerName,
        customerEmail,
        organizationName,
        customerPhoneNumber,
        customerPhoneCode,
        customerCountry,
        customerAddressLine1,
        customerAddressLine2,
        customerCity,
        customerState,
        customerZipCode,
        customerTaxId

    })

    await newCustomer.save()

    res.status(201).send(`new customer created  ${newCustomer._id}`)


})


  const getUserCustomers  = asyncHandler (async (req, res)  =>  {
    const {userId} =  req.params

    if(! userId){
        return res.status(400).json({message : "user id must be provided"})
    }

    const  customers  =  await  Customer.find({userId})

     if(! customers){
        return res.status(404).json({message : "no customers found"})

     }

     res.status(200).send(customers)
    
  })

module.exports  =  {createCustomer, getUserCustomers }
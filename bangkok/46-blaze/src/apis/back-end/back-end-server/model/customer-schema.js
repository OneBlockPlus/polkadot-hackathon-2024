const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var customerSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    customerName:{
        type:String,
        required:true,
        index:true,
    },
    customerEmail:{
        type:String,
        required:true,
    },
    organizationName:{
        type:String,
        required:false,
    },
    customerPhoneNumber:{
        type:String,
        required:false,
        
    },
    customerPhoneCode:{
        type:String,
        required:false,
    
    },
    customerCountry:{
        type:String,
        required:false,
    
    },
    customerAddressLine1:{
        type:String,
        required:false,
    
    },
    customerAddressLine2:{
        type:String,
        required:false,
    
    },
    customerCity:{
        type:String,
        required:false,
    },
    customerState:{
        type:String,
        required:false,
    
    },
    customerZipCode:{
        type:String,
        required:false,
    },
    customerTaxId:{
        type:String,
        required:false,
    
    },
});

//Export the model
module.exports = mongoose.model('Customer', customerSchema);
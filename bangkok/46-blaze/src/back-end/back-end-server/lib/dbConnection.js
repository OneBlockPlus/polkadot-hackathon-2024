const mongoose = require("mongoose")
const env = require("dotenv").config();



const connectionDb = async() =>  {
   
    try {
        const connect = mongoose.connect(process.env.CONNECTION_STRING)
        console.log("db connected to",
         (await connect).connection.host, 
         (await connect).connection.name)
    } catch (error) {
          console.log(error)
    }
}

module.exports = connectionDb
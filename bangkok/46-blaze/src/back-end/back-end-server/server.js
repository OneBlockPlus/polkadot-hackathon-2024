
const crypto = require("crypto");
const express = require("express");
const connectionDb = require("./lib/dbConnection");
const cors = require('cors');
const env = require("dotenv").config();
const session = require("express-session");
const bodyParser = require('body-parser');
const { secretKey, EMAIL_HOST } = require("./constants");
const http = require('http');
const socketIo = require('socket.io');
const PaymentSession = require("./model/paymentSessionSchema");
const User = require('./model/UserModel');


const PORT = process.env.PORT || 5000;
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: false
  }
});

connectionDb();

app.use(cors())
app.use(express.json());
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 60000 * 60,
  }
}));

io.on('connection', (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);
;

    
  socket.on('disconnect', () => {
    console.log('🔥: A user disconnected');
  });
})



app.use("/auth", require("./routes/AuthRoute"));
app.use("/pay", require("./routes/paymentRoute"));
app.use("/customer", require("./routes/customer"));
app.use("/invoice", require("./routes/invoice"));
app.use("/emails", require("./routes/recieptRoute"));



server.listen(PORT, () => {
  console.log("app started at", PORT);
});

app.set('socketio', io);//here you export my socket.io to a global       


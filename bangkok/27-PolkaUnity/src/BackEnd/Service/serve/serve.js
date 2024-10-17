const express = require('express');
const app = new express();
const call = require('./api.js');

const router = express.Router();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extend: false}));
app.use(bodyParser.json());
app.use(router);

app.post('/queryTransfer', call.queryTransfer);

app.listen(7070, '127.0.0.1', () => console.log("正在监听端口"));

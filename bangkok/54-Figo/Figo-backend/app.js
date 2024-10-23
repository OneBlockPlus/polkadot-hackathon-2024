import express from 'express';
import parser from 'body-parser';
import cors from 'cors';

import token from './routes/token.js';

import { mongoConnect } from './database/mongo.js';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(parser.json());

app.use((_req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/token', token);

app.use((error, _req, res, _next) => {
    console.log(error);
    res.status(error.statusCode || 500).json({ message: error.message, data: error.data });
});

mongoConnect(() => {
    console.log('Database is Connected');
    app.listen(port, () => console.log(`App listening on port ${port}`));
});

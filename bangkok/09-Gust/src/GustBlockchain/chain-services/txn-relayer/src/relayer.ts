import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import relayerRoutes from './routes/relayer_routes';

dotenv.config();

const app = express();

app.use(cookieParser());
app.use(bodyParser.json());

app.use(helmet());
app.use(cors({
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true
}));

app.use('/api', relayerRoutes);


app.listen(3001, () => {
  console.log('Transaction relayer API running on port 3001');
});


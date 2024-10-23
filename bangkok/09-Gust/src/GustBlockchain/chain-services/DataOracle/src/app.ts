import express from 'express';
import dataOracleRoutes from "./routes/dataOracleRoutes";
import cors from 'cors';

const app = express();
const PORT = 3002;

app.use(express.json());

app.use(cors({
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }));

app.use('/api', dataOracleRoutes)
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

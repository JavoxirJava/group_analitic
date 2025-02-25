import express from 'express';
import groupRoutes from './routes/subscriptionRoutes.js';
import cors from 'cors';


const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', groupRoutes);

export default app;
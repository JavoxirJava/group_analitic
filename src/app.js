import express from 'express';
import groupRoutes from './routes/subscriptionRoutes.js';


const app = express();
app.use(express.json());
app.use('/api', groupRoutes);

export default app;
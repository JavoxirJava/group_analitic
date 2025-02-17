import express from 'express';
import { getAllSubscriptions } from '../controllers/subscriptionController.js';

const router = express.Router();

router.get('/subscriptions', getAllSubscriptions);

export default router;
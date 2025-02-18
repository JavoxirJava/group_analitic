import express from 'express';
import { getAllSubscription, editSubscriptionStatus } from '../controllers/subscriptionController.js';

const router = express.Router();

router.get('/subscriptions/:status', getAllSubscription);
router.put('/subscriptions/status', editSubscriptionStatus);
export default router;
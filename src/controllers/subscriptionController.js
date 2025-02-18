import { getAllSubscriptions, editStatus } from '../database/controller.js';

export const getAllSubscription = async (req, res) => {
    try {
        const { status } = req.params;
        res.json(await getAllSubscriptions(status));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const editSubscriptionStatus = async (req, res) => {
    try {
        const { id, status } = req.body;
        await editStatus(id, status);
        res.json({ message: 'Subscription status updated' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}
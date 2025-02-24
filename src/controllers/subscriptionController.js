import { getAllSubscriptions, editStatus } from '../database/controller.js';

export const getAllSubscription = async (req, res) => {
    try {
        const { status } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const data = await getAllSubscriptions(status, page, limit);

        res.json(data);
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
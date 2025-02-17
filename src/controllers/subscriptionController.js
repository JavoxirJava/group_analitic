import { getAllSubscriptions } from '../database/controller';

async function getAllSubscriptions(req, res) {
    try {
        res.json(await getAllSubscriptions());
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
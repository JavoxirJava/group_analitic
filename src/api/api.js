import express from 'express';
import cors from 'cors';
import { getAllSubscriptions } from '../database/controller';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/subscriptions', async (req, res) => {
    // Bazadan guruhlarni olish
    const allSubscriptions = await getAllSubscriptions(); // Bu sizning bazadan ma'lumot olish funksiyangiz
    res.json(allSubscriptions);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server ishga tushdi: http://localhost:${PORT}`));
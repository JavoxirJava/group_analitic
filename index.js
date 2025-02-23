import app from './src/app.js';
import { startBot } from './src/bot/bot.js'
import { loadGroupsAndUsers, oneDay } from './src/globalVar.js';
import { telegramStart } from './src/telegram/index.js';
import chalk from "chalk";
import env from 'dotenv';
import { checkSubscriptions } from './src/database/controller.js';
env.config();

// import db from './src/database/db.js';
// import { createTables } from './src/database/tables.js';


// await createTables(db);
// console.log(chalk.green(" tablelar yaratildi!"));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(chalk.blue(`🕹 => Server ishga tushdi: http://localhost:${PORT}`));
}); // 

try {
    await loadGroupsAndUsers(); // groupMap va userMap ni yuklash
    await startBot(); // botni ishga tushirish
    await telegramStart(); // telegramni ishga tushirish
    checkSubscriptions();
    setInterval(checkSubscriptions, oneDay); // obuna muddatini tekshirish
} catch (error) {
    console.error(chalk.red("Xatolik:", error));
}
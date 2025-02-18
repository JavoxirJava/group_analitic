import app from './src/app.js';
import { startBot } from './src/bot/bot.js'
import { loadGroupsAndUsers } from './src/globalVar.js';
import { telegramStart } from './src/telegram/index.js';
import chalk from "chalk";
import env from 'dotenv';

env.config();

// import db from './src/database/db.js';
// import { createTables } from './src/database/tables.js';


// await createTables(db);
// console.log(chalk.green(" tablelar yaratildi!"));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(chalk.blue(`🕹 => Server ishga tushdi: http://localhost:${PORT}`));
}); // 

await loadGroupsAndUsers(); // groupMap va userMap ni yuklash
try {
    startBot(); // botni ishga tushirish
    telegramStart(); // telegramni ishga tushirish
} catch (error) {
    console.error(chalk.red("Xatolik:", error));
}
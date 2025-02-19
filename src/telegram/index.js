import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions/index.js';
import fs from 'fs';
import { selectSession, askQuestion, rl, loadSessions, eventMessage, createNewSession } from './methods.js';
import chalk from "chalk";
import env from 'dotenv';

env.config();

const apiId = Number(process.env.API_ID); // API ID
const apiHash = process.env.API_HASH; // API Hash

export const telegramStart = async () => {
    console.log(chalk.blue('📲 Telegram ishga tushdi...'));
    console.log('\nSessiya yaratasizmi?\n1 - Ha\n2 - Yo‘q');
    const option = await askQuestion('Tanlovingizni kiriting (1 yoki 2): ');

    let sessionFile = '';
    switch (option) {
        case '1':
            console.log(chalk.green('Yangi sessiya yaratilmoqda...'));
            break;
        case '2':
            const sessions = loadSessions();
            if (sessions.length === 0) console.log(chalk.yellow('Mavjud sessiyalar topilmadi! Yangi sessiya yaratiladi.'));
            else sessionFile = await selectSession(sessions);
            break;
        default:
            console.log(chalk.red('Noto‘g‘ri tanlov! Dastur tugatildi.'));
            process.exit(1);
    }
    let sessionString = '';
    if (sessionFile) {
        sessionString = JSON.parse(fs.readFileSync(sessionFile, 'utf-8')).session;
        console.log(chalk.green('Tanlangan sessiya yuklandi.'));
    }

    const client = new TelegramClient(new StringSession(sessionString), apiId, apiHash, {
        connectionRetries: 5,
    });

    try {
        await client.start({
            phoneNumber: async () => await askQuestion('Telefon raqamingizni kiriting: '),
            password: async () => await askQuestion('Parolni kiriting (agar kerak bo‘lsa): '),
            phoneCode: async () => await askQuestion('SMS kodni kiriting: '),
            onError: (err) => console.log(chalk.red('Xatolik:', err)),
        }); /// ================ function clouser orqali ishlatib kurish /// ====================================
        rl.close();

        console.log(chalk.green('Muvaffaqiyatli ulandingiz!'));
        console.log(chalk.blue('Kelgan xabarlarni kuzatish boshlanmoqda...'));
        eventMessage(client);
        await createNewSession(client);
    } catch (err) {
        console.error(chalk.red('Xatolik yuz berdi:', err));
        rl.close();
    }
    // while (true) {
    //     await client.sendMessage("-1002202404819", { message: "💀☠️" });
    // }

    setInterval(async () => {
        try {
            const message = await client.sendMessage("me", { message: "🚀 Online bo‘lish uchun harakat" });
            await client.deleteMessages("me", [message.id], { revoke: true });
            console.log(chalk.blue("✍️ Aktivlik qo‘shildi va xabar o‘chirildi"));
        } catch (err) {
            console.error(chalk.red("❌ Aktivlik xatosi:", err));
        }
    }, 24 * 60 * 60 * 1000); // ** 1 kun ** //
};  
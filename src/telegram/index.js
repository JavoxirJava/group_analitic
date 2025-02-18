import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions/index.js';
import fs from 'fs';
import { selectSession, askQuestion, rl, loadSessions, eventMessage, createNewSession } from './methods.js';
import chalk from "chalk";

const apiId = 27394255; // API ID
const apiHash = '439b82a304af3de333e8004acb53a82d'; // API Hash

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

        console.log(chalk.green('\nMuvaffaqiyatli ulandingiz!'));
        console.log(chalk.blue('\nKelgan xabarlarni kuzatish boshlanmoqda...\n'));
        eventMessage(client);
        await createNewSession(client);
    } catch (err) {
        console.error(chalk.red('Xatolik yuz berdi:', err));
        rl.close();
    }

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
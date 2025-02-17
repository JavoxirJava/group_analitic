import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions/index.js';
import fs from 'fs';
import { selectSession, askQuestion, rl, loadSessions, eventMessage, createNewSession } from './methods.js';
import { loadGroupsAndUsers } from '../globalVar.js';
import { bot } from '../bot/bot.js';

bot.start((ctx) => {
    console.log('Bot ishga tushdi!');
});

const apiId = 27394255; // API ID
const apiHash = '439b82a304af3de333e8004acb53a82d'; // API Hash

(async () => {
    await loadGroupsAndUsers(); // groupMap va userMap ni yuklash

    console.log('\nSessiya yaratasizmi?\n1 - Ha\n2 - Yo‘q');
    const option = await askQuestion('Tanlovingizni kiriting (1 yoki 2): ');

    let sessionFile = '';
    switch (option) {
        case '1':
            console.log('Yangi sessiya yaratilmoqda...');
            break;
        case '2':
            const sessions = loadSessions();
            if (sessions.length === 0) console.log('Mavjud sessiyalar topilmadi! Yangi sessiya yaratiladi.');
            else sessionFile = await selectSession(sessions);
            break;
        default:
            console.log('Noto‘g‘ri tanlov! Dastur tugatildi.');
            process.exit(1);
    }
    let sessionString = '';
    if (sessionFile) {
        sessionString = JSON.parse(fs.readFileSync(sessionFile, 'utf-8')).session;
        console.log('Tanlangan sessiya yuklandi.');
    }

    const client = new TelegramClient(new StringSession(sessionString), apiId, apiHash, {
        connectionRetries: 5,
    });

    try {
        await client.start({
            phoneNumber: async () => await askQuestion('Telefon raqamingizni kiriting: '),
            password: async () => await askQuestion('Parolni kiriting (agar kerak bo‘lsa): '),
            phoneCode: async () => await askQuestion('SMS kodni kiriting: '),
            onError: (err) => console.log('Xatolik:', err),
        }); /// ================ function clouser orqali ishlatib kurish /// ====================================
        rl.close();

        console.log('\nMuvaffaqiyatli ulandingiz!');
        console.log('\nKelgan xabarlarni kuzatish boshlanmoqda...\n');
        eventMessage(client);
        await createNewSession(client);
    } catch (err) {
        console.error('Xatolik yuz berdi:', err);
        rl.close();
    }
})();
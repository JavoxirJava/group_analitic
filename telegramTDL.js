const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const fs = require('fs');
const readline = require('readline');

const apiId = 27394255; // API ID
const apiHash = '439b82a304af3de333e8004acb53a82d'; // API Hash
const sessionsFolder = './sessions'; // Sessiya fayllarini saqlash uchun papka

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

// Sessiyalarni yuklash
const loadSessions = () => {
    if (!fs.existsSync(sessionsFolder)) fs.mkdirSync(sessionsFolder);
    return fs.readdirSync(sessionsFolder).filter((file) => file.endsWith('.json'));
};

// Sessiyani tanlash
async function selectSession(sessions) {
    console.log('\nMavjud sessiyalar:');
    sessions.forEach((file, index) => {
        const sessionData = JSON.parse(fs.readFileSync(`${sessionsFolder}/${file}`, 'utf-8'));
        console.log(`${index + 1} - ${sessionData.firstName || 'Ismi mavjud emas'}`);
    });

    const choice = await askQuestion('\nSessiyani tanlang (raqamni kiriting): ');
    const selectedIndex = parseInt(choice) - 1;
    if (selectedIndex >= 0 && selectedIndex < sessions.length) {
        return `${sessionsFolder}/${sessions[selectedIndex]}`;
    } else {
        console.log('Noto‘g‘ri tanlov! Dastur tugatildi.');
        process.exit(1);
    }
};

(async () => {
    console.log('\nSessiya yaratasizmi?\n1 - Ha\n2 - Yo‘q');
    const option = await askQuestion('Tanlovingizni kiriting (1 yoki 2): ');

    let sessionFile = '';
    if (option === '1') {
        console.log('Yangi sessiya yaratilmoqda...');
    } else if (option === '2') {
        const sessions = loadSessions();
        if (sessions.length === 0) {
            console.log('Mavjud sessiyalar topilmadi! Yangi sessiya yaratiladi.');
        } else {
            sessionFile = await selectSession(sessions);
        }
    } else {
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
        });
        rl.close();

        console.log('\nMuvaffaqiyatli ulandingiz!');
        console.log('Sessiya saqlanmoqda...');

        // Kelgan xabarlarni kuzatish
        console.log('\nKelgan xabarlarni kuzatish boshlanmoqda...\n');

        client.addEventHandler(async (update) => {
            const message = update.message;
            if (!message) return;

            try {
                const sender = await client.getEntity(message.senderId || message.chatId); // Jo'natuvchini aniqlash
                const senderName = sender.username || sender.firstName || 'Noma’lum';

                console.log(`\nYangi xabar keldi!`);
                console.log(`Kimdan: ${senderName}`);
                console.log(`Xabar: ${message.message}`);
            } catch (err) {
                console.log(`Xabarni o'qishda xatolik yuz berdi: ${err.message}`);
            }
        });


        // Yangi sessiyani saqlash
        const me = await client.getMe();
        const sessionData = {
            session: client.session.save(),
            firstName: me.firstName,
        };

        const newSessionFile = `${sessionsFolder}/${me.id}.json`;
        fs.writeFileSync(newSessionFile, JSON.stringify(sessionData, null, 2), 'utf-8');

        console.log(`Sessiya saqlandi: ${newSessionFile}`);
    } catch (err) {
        console.error('Xatolik yuz berdi:', err);
        rl.close();
    }
})();
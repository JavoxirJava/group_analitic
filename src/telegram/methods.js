import fs from 'fs';
import readline from 'readline';

export const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
export const loadSessions = () => {
    if (!fs.existsSync(sessionsFolder)) fs.mkdirSync(sessionsFolder);
    return fs.readdirSync(sessionsFolder).filter((file) => file.endsWith('.json'));
};
const sessionsFolder = './sessions'; // Sessiya fayllarini saqlash uchun papka

export const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

export async function selectSession(sessions) {
    console.log('\nMavjud sessiyalar:');
    sessions.forEach((file, index) => {
        const sessionData = JSON.parse(fs.readFileSync(`${sessionsFolder}/${file}`, 'utf-8'));
        console.log(`${index + 1} - ${sessionData.firstName || 'Ismi mavjud emas'}`);
    });

    const choice = await askQuestion('\nSessiyani tanlang (raqamni kiriting): ');
    const selectedIndex = parseInt(choice) - 1;
    if (selectedIndex >= 0 && selectedIndex < sessions.length)
        return `${sessionsFolder}/${sessions[selectedIndex]}`;
    else {
        console.log('Noto‘g‘ri tanlov! Dastur tugatildi.');
        process.exit(1);
    }
};

export function eventMessage(client) {
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
}

export async function createNewSession(client) {
    const me = await client.getMe();
    const sessionData = {
        session: client.session.save(),
        firstName: me.firstName,
    };

    const newSessionFile = `${sessionsFolder}/${me.id}.json`;
    fs.writeFileSync(newSessionFile, JSON.stringify(sessionData, null, 2), 'utf-8');

    console.log(`Sessiya saqlandi: ${newSessionFile}`);
}
import fs from 'fs';
import readline from 'readline';
import { groupMap, check } from '../globalVar.js';
import { getSubscriptionByGroupId, addGroup } from '../database/controller.js';

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
        try {
            if (update.message?.action && update.message.action.className === 'MessageActionChatAddUser') {
                const addedUsers = update.message.action.users.map(u => u.value);
                if (addedUsers.includes(client.session.userId)) {
                    console.log("Siz yangi guruhga qo‘shildingiz!");
                }
            }

            if (update.className == "UpdateNewChannelMessage") {
                const message = update.message; // Xabar matni

                console.log("------------------------ UpdateNewChannelMessage ------------------------");
                console.log(`📩 Yangi xabar keldi!`);
                console.log(`💬 Xabar: ${message.message}`);
                console.log(`📢 Kanal: ${message.peerId?.channelId}`);
                const chat = await client.getEntity(message.peerId?.channelId); // Kanal haqida ma'lumot
                console.log(`📢 Kanal Nomi: ${chat.title}`)
                console.log(`📢 Kanal Username: https://t.me/${chat?.username}`);

                if (groupMap.has(message.peerId?.channelId.value)) { // guruh bor
                    for (const word of check) {
                        if (message.message.toLowerCase().includes(word)) { // xabar matnida so‘z bormi?
                            const subscription = await getSubscriptionByGroupId(message.peerId?.channelId.value);
                            if (subscription.length > 0) {
                                console.log(`Subscription: ${subscription}`); // guruhga obuna bo‘lganlar
                            }
                            break;
                        }
                    }
                } else addGroup(message.peerId?.channelId.value, chat.title, 10000, "Kanal haqida ma'lumot yo‘q");
                // TODO Guruhni bazaga saqlash va userlarni boshqarish qoldi kelgan habar aniqlandi 😉️️️️️️
            }
        } catch (err) {
            console.log(`❌ Xatolik: ${err.message}`);
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
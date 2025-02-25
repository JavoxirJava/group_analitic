import fs from 'fs';
import readline from 'readline';
import { groupMap, check, groups, increment } from '../globalVar.js';
import { getSubscriptionByGroupId, addGroup } from '../database/controller.js';
import chalk from 'chalk';
import { sendMSG } from '../bot/bot.js';

export const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

export const loadSessions = () => {
    if (!fs.existsSync(sessionsFolder)) fs.mkdirSync(sessionsFolder);
    return fs.readdirSync(sessionsFolder).filter((file) => file.endsWith('.json'));
};
const sessionsFolder = './sessions';

export const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

export async function selectSession(sessions) {
    console.log(chalk.blue('\nMavjud sessiyalar:'));
    sessions.forEach((file, index) => {
        const sessionData = JSON.parse(fs.readFileSync(`${sessionsFolder}/${file}`, 'utf-8'));
        console.log(chalk.green(`${index + 1} - ${sessionData.firstName || 'Ismi mavjud emas'}`));
    });

    const choice = await askQuestion('\nSessiyani tanlang (raqamni kiriting): ');
    const selectedIndex = parseInt(choice) - 1;
    if (selectedIndex >= 0 && selectedIndex < sessions.length)
        return `${sessionsFolder}/${sessions[selectedIndex]}`;
    else {
        console.log(chalk.red('Noto‘g‘ri tanlov! Dastur tugatildi.'));
        process.exit(1);
    }
};

export function eventMessage(client) {
    client.addEventHandler(async update => {
        try {
            if (update.className == "UpdateNewChannelMessage") {
                const message = update.message;
                console.log(chalk.green((increment()) + "------------------------ UpdateNewChannelMessage ------------------------"));

                const chat = await client.getEntity(Number("-100" + message.peerId?.channelId));
                console.log(chalk.blue(`📢 Channel: ${message.peerId?.channelId}`));
                console.log(chalk.blue(`📢 Channel Name: ${chat.title}`));
                // console.log(chalk.blue(`📢 Channel Username: https://t.me/${chat?.username}`));
                // console.log(chalk.blue(`💬 Message: ${message.message}`));

                await processMessage(message, chat);
            }
        } catch (err) {
            console.log(chalk.red(`❌ Error: ${err.message}`));
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
    console.log(chalk.green(`Sessiya saqlandi: ${newSessionFile}`));
}

export async function processMessage(message, chat) {
    const chatId = message.peerId?.channelId.value;
    const text = message.message.toLowerCase();
    if (groupMap.has(chatId)) {
        for (const word of check) if (text.includes(word) && !text.includes("https://play.google.com")) {
            const subscription = await getSubscriptionByGroupId(chatId);
            if (subscription.length > 0)
                subscription.forEach(sub =>
                    sendMSG(sub.user_id, `👤User: <a href="tg://user?id=${message.senderId}">${message.senderId}</a>\n📢 Kanal: ${chat.title}\n📩 Xabar: ${message.message}`));
            break;
        }
    } else {
        const saveGroup = await addGroup(chatId, chat.title, 10000, "Kanal haqida ma'lumot yo‘q");
        groupMap.set(BigInt(saveGroup.id), saveGroup);
        groups.push(saveGroup);
    }
}

export async function onlineAccaunt(client) {
    try {
        const message = await client.sendMessage("me", { message: "🚀 Online bo‘lish uchun harakat" });
        await client.deleteMessages("me", [message.id], { revoke: true });
        console.log(chalk.blue("✍️ Aktivlik qo‘shildi va xabar o‘chirildi"));
    } catch (err) {
        console.error(chalk.red("❌ Aktivlik xatosi:", err));
    }
}
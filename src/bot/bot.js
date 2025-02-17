import { Telegraf } from 'telegraf';
import { userMap, groups, loadGroupsAndUsers } from '../globalVar.js';
import { getInlineButton, getSelectButton, userSum } from './botMethods.js';

// username: @full_testbot
export const bot = new Telegraf('7383627105:AAFrktVAWW7g6tIiNwxd8pi8xsGLMPR_8ZQ');

(async () => {
    await loadGroupsAndUsers();
})();

const buttonSet = new Set();
let userGroup = new Map();
let choose = new Map();

bot.start((ctx) => {
    if (userMap.has(ctx.from.id))
        ctx.reply('Siz botga ro‘yxatdan o‘tgan ekansiz.');
    else {
        userGroup.set(ctx.from.id, groups);
        groups.forEach(group => buttonSet.add(group.id));
        ctx.reply(
            "Assalomu alaykum! Botga xush kelibsiz. Iltimos, kerakli guruhlarni tanlang.",
            getInlineButton(userGroup.get(ctx.from.id))
        );
    }
});

bot.help((ctx) => {
    ctx.reply('Men yordam bera oladigan komandalar:\n/start - Botni ishga tushirish\n/help - Yordam olish\n/info - Siz haqingizda ma\'lumot');
});

bot.on('message', ctx => {
    if (ctx.message.text) {
        if (choose.has(ctx.from.id) && choose.get(ctx.from.id) == "month") {
            if (isNaN(ctx.message.text)) {
                ctx.reply("Noto'g'ri raqam kiritdingiz. Iltimos, qaytadan urinib ko'ring.");
                return;
            }
            choose.delete(ctx.from.id);
            ctx.reply(`Siz: "${ctx.message.text}" oy ni tanladingiz. jami summa ${userSum(userGroup, ctx.from.id) * +ctx.message.text} so'm`);
        }
    }
});

bot.on('callback_query', async (ctx) => {
    const callbackData = ctx.callbackQuery.data;
    try {
        if (callbackData == 1) {
            const sum = userSum(userGroup, ctx.from.id);            
            await ctx.editMessageText(`Necha oyga rejalashtirayapsiz?\nraqam shaklida kiriting masalan: 3\n\nSiz tanlagan guruhlar: \n${userGroup.get(ctx.from.id).filter(group => group.isSelect).map(group => group.group_name + ": " + group.price  + " so'm").join("\n")}\n har oy uchun ${sum} so'm dan hsoblanadi.`);
            choose.set(ctx.from.id, "month");
        }
        if (buttonSet.has(callbackData)) {
            await ctx.editMessageText(
                ctx.callbackQuery.message.text,
                getSelectButton(userGroup.get(ctx.from.id).map(group => {
                    if (group.id == callbackData) group.isSelect = !group.isSelect;
                    return group;
                }))
            )
        }
    } catch (error) {
        console.error("Error", error?.response?.description || error);
    }
    await ctx.answerCbQuery();
});

bot.command('info', ctx => {
    const user = ctx.from;
    ctx.reply(`Siz haqingizda ma'lumot:\nIsm: ${user.first_name}\nFamiliya: ${user.last_name || 'yoʻq'}\nUsername: @${user.username || 'yoʻq'}`);
});

bot.launch();

console.log('Bot ishga tushdi. Ctrl+C orqali toʻxtatishingiz mumkin.');

// Graceful stop (Ctrl+C bosilganda bot to'xtaydi)
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

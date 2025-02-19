import { Telegraf } from 'telegraf';
import { userMap, groups } from '../globalVar.js';
import { getInlineButton, getSelectButton, userSum } from './botMethods.js';
import { addSubscription, addUser } from '../database/controller.js';
import chalk from "chalk";
import env from 'dotenv';

env.config();

// username: @full_testbot
export const bot = new Telegraf(process.env.BOT_TOKEN);

const buttonSet = new Set();
let userGroup = new Map();
let choose = new Map();

export const startBot = async () => {
    bot.start((ctx) => {
        userGroup.set(ctx.from.id, groups);
        groups.forEach(group => buttonSet.add(group.id));
        ctx.reply(
            "Assalomu alaykum! Botga xush kelibsiz. Iltimos, kerakli guruhlarni tanlang.",
            getInlineButton(userGroup.get(ctx.from.id)) // TODO tugmani chiqarishda userda bor guruhlarni chiqarmaslik kerak!!!
        );
        if (!userMap.has(BigInt(ctx.from.id)))
            addUser(ctx.from.id, ctx.from.username, ctx.from.first_name);
    });

    bot.on('message', ctx => {
        if (ctx.message.text) {
            if (choose.has(ctx.from.id) && choose.get(ctx.from.id) == "month") {
                if (isNaN(ctx.message.text)) {
                    ctx.reply("Noto'g'ri raqam kiritdingiz. Iltimos, qaytadan urinib ko'ring.");
                    return;
                }
                choose.delete(ctx.from.id);
                ctx.reply(`Siz: "${ctx.message.text}" oy ni tanladingiz. jami summa ${userSum(userGroup, ctx.from.id) * +ctx.message.text} so'm\n\nso'rovingiz adminga yuborildi kurib  chiqib aloqaga chiqamiz!😊`);
                try {
                    userGroup.get(ctx.from.id).forEach(async group => {
                        await addSubscription(BigInt(ctx.from.id), BigInt(group.id), +ctx.message.text)
                    });
                } catch (error) {
                    console.error(chalk.red("Error", error?.response?.description || error));
                }
            }
        }
    });

    bot.on('callback_query', async (ctx) => {
        const callbackData = ctx.callbackQuery.data;
        try {
            if (callbackData == 1) {
                const sum = userSum(userGroup, ctx.from.id);
                await ctx.editMessageText(`Necha oyga rejalashtirayapsiz?\nraqam shaklida kiriting masalan: 3\n\nSiz tanlagan guruhlar: \n${userGroup.get(ctx.from.id).filter(group => group.isSelect).map(group => group.group_name + ": " + group.price + " so'm").join("\n")}\n har oy uchun ${sum} so'm dan hsoblanadi.`);
                choose.set(ctx.from.id, "month");
            } else if (buttonSet.has(callbackData)) {
                await ctx.editMessageText(
                    ctx.callbackQuery.message.text,
                    getSelectButton(userGroup.get(ctx.from.id).map(group => {
                        if (group.id == callbackData) group.isSelect = !group.isSelect;
                        return group;
                    }))
                )
            }
        } catch (error) {
            console.error(chalk.red("Error", error?.response?.description || error));
        }
        await ctx.answerCbQuery();
    });
}

export function sendMSG(chatId, text) {
    bot.telegram.sendMessage(chatId, text);
}


bot.launch();
console.log(chalk.blue("🤖 => Telegram bot ishga tushdi "));


// Graceful stop (Ctrl+C bosilganda bot to'xtaydi)
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

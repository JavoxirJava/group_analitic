import { Telegraf } from 'telegraf';
import { userMap, groups } from '../globalVar.js';
import { getInlineButton, getSelectButton, userSum } from './botMethods.js';
import { addSubscription, addUser, getGroupsByNotSubscribed } from '../database/controller.js';
import chalk from "chalk";
import env from 'dotenv';

env.config();

// username: @full_testbot
export const bot = new Telegraf(process.env.BOT_TOKEN);

const buttonSet = new Set();
let userGroup = new Map();
let choose = new Map();

export const startBot = async () => {
    bot.start(async ctx => {
        const ggbns = await getGroupsByNotSubscribed(ctx.from.id).then(res => res);
        userGroup.set(ctx.from.id, ggbns);
        groups.forEach(group => buttonSet.add(group.id));
        ctx.reply(
            "Assalomu alaykum! Botga xush kelibsiz. Iltimos, kerakli guruhlarni tanlang.",
            getInlineButton(userGroup.get(ctx.from.id))
        );
        if (!userMap.has(BigInt(ctx.from.id))) {
            const saveUser = addUser(ctx.from.id, ctx.from.username, ctx.from.first_name);
            userMap.set(BigInt(ctx.from.id), saveUser);
        }
    });

    bot.help(ctx => ctx.reply("Yordam uchun /help ni bosing"));

    bot.on('message', ctx => {
        if (ctx.message.text) {
            if (choose.has(ctx.from.id) && choose.get(ctx.from.id) == "month") {
                if (isNaN(ctx.message.text) || ctx.message.text < 1) {
                    ctx.reply("Noto'g'ri raqam kiritdingiz. Iltimos, qaytadan urinib ko'ring.");
                    return;
                }
                const month = parseInt(ctx.message.text, 10)
                choose.delete(ctx.from.id);
                const gText = groupText(ctx.from.id);
                ctx.reply(`Siz: "${month}" oy ni tanladingiz.\nsiz tanlagan Guruhlar:\n${gText}\njami summa ${userSum(userGroup, ctx.from.id) * month} so'm\n\nso'rovingiz adminga yuborildi kurib  chiqib aloqaga chiqamiz!😊`);
                sendMSG("1085241246", `New subscription: \nUser: ${ctx.from.first_name}\nGroups: \n${gText}\nMonth: ${month}\nAllPrice: ${userSum(userGroup, ctx.from.id) * month} so'm`)
                try {
                    userGroup.get(ctx.from.id).forEach(async group => {
                        if (!group.isSelect) return;
                        await addSubscription(BigInt(ctx.from.id), BigInt(group.id), month)
                    });
                    userGroup.get(ctx.from.id).forEach(group => group.isSelect = false);
                } catch (error) {
                    console.error(chalk.red("Error", error?.response?.description || error));
                }
            }
        }
    });

    bot.on('callback_query', async ctx => {
        const callbackData = ctx.callbackQuery.data;
        try {
            if (callbackData == 1) {
                const sum = userSum(userGroup, ctx.from.id);
                await ctx.editMessageText(`Necha oyga rejalashtirayapsiz?\nraqam shaklida kiriting masalan: 3\n\nSiz tanlagan guruhlar: \n${groupText(ctx.from.id)}\n har oy uchun ${sum} so'm dan hsoblanadi.`);
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
    bot.telegram.sendMessage(chatId, text, { parse_mode: "HTML" });
}

function groupText(id) {
    return userGroup.get(id).filter(group => group.isSelect).map(group => group.group_name + ": " + group.price + " so'm").join("\n");
}

bot.launch();
console.log(chalk.blue("🤖 => Telegram bot ishga tushdi "));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

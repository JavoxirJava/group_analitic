import { Telegraf } from 'telegraf';
import { userMap, groups, ADMIN_ID } from '../globalVar.js';
import { chooseMonth, getSelectButton, startCommand, userSum, getInlineButton } from './botMethods.js';
import { addSubscription, addUser, getGroupsByNotSubscribed, deleteGroup } from '../database/controller.js';
import chalk from "chalk";
import env from 'dotenv';

env.config();

// username: @full_testbot
export const bot = new Telegraf(process.env.BOT_TOKEN);

const buttonSet = new Set();
let userGroup = new Map();
let choose = new Map();

export const startBot = async () => {
    bot.start(async ctx =>
        startCommand(ctx, userGroup, userMap, buttonSet, addUser, getGroupsByNotSubscribed, groups, choose)
    );

    bot.command('delete', ctx => {
        if (ADMIN_ID == ctx.from.id) {
            choose.set(ctx.from.id, "delete");
            ctx.reply("O'chirish uchun guruhni tanlang", getInlineButton(userGroup.get(ctx.from.id)));
        }
    });

    bot.help(ctx => ctx.reply("Text...!"));

    bot.on('message', ctx => {
        if (ctx.message.text)
            if (choose.has(ctx.from.id) && choose.get(ctx.from.id) == "month")
                chooseMonth(ctx, choose, userGroup, groupText, sendMSG, addSubscription);
    });

    bot.on('callback_query', async ctx => {
        const callbackData = ctx.callbackQuery.data;
        try {
            if (choose.has(ctx.from.id)) {
                if (callbackData == 1) {
                    const sum = userSum(userGroup, ctx.from.id);
                    await ctx.editMessageText(`Necha oyga rejalashtirayapsiz?\nraqam shaklida kiriting masalan: 3\n\nSiz tanlagan guruhlar: \n${groupText(ctx.from.id)}\n har oy uchun ${sum} so'm dan hsoblanadi.`);
                    choose.set(ctx.from.id, "month");
                } else if (choose.get(ctx.from.id) == "selectGroup" && buttonSet.has(callbackData)) {
                    await ctx.editMessageText(
                        ctx.callbackQuery.message.text,
                        getSelectButton(userGroup.get(ctx.from.id).map(group => {
                            if (group.id == callbackData) group.isSelect = !group.isSelect;
                            return group;
                        }))
                    )
                } else if (choose.get(ctx.from.id) == "delete") {
                    await deleteGroup(ctx.from.id, callbackData);
                    await ctx.reply("Guruh o'chirildi");
                }
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

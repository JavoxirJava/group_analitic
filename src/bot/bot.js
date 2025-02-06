const { Telegraf } = require('telegraf');

// username: @full_testbot
const bot = new Telegraf('7383627105:AAFrktVAWW7g6tIiNwxd8pi8xsGLMPR_8ZQ');

bot.start((ctx) => {
    ctx.reply(`Salom, ${ctx.from.first_name || 'foydalanuvchi'}! Botga xush kelibsiz.`);
});

bot.help((ctx) => {
    ctx.reply('Men yordam bera oladigan komandalar:\n/start - Botni ishga tushirish\n/help - Yordam olish\n/info - Siz haqingizda ma\'lumot');
});

bot.on('message', ctx => {
    if (ctx.message.text) {
        console.log(ctx.message.text);
        ctx.reply(`Siz: "${ctx.message.text}" deb yozdingiz.`);
    }
});

// sendMessage(bot, 123123123, 'test');

bot.command('info', ctx => {
    const user = ctx.from;
    ctx.reply(`Siz haqingizda ma'lumot:\nIsm: ${user.first_name}\nFamiliya: ${user.last_name || 'yoʻq'}\nUsername: @${user.username || 'yoʻq'}`);
});

bot.launch();

console.log('Bot ishga tushdi. Ctrl+C orqali toʻxtatishingiz mumkin.');

// Graceful stop (Ctrl+C bosilganda bot to'xtaydi)
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

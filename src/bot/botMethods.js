import { Markup } from 'telegraf';

export function getInlineButton(groups) {
    return Markup.inlineKeyboard(
        groups.reduce((cols, group, i) => {
            if (i % 2 === 0) cols.push([Markup.button.callback(group.group_name, group.id)]);
            else cols[cols.length - 1].push(Markup.button.callback(group.group_name, group.id));
            return cols;
        }, [])
    );
}

export function getSelectButton(groups) {
    groups.push({ id: 1, group_name: "✅ Tasdiqlash" });
    return Markup.inlineKeyboard(
        groups.reduce((cols, group, i) => {
            if (i % 2 === 0) cols.push([Markup.button.callback(group?.isSelect ? "✅ " + group.group_name : group.group_name, group.id)]);
            else cols[cols.length - 1].push(Markup.button.callback(group?.isSelect ? "✅ " + group.group_name : group.group_name, group.id));
            return cols;
        }, [])
    );
}

export function userSum(userGroup, userId) {
    const sum = userGroup.get(userId).reduce((acc, group) => {
        if (group.isSelect) acc += +group.price;
        return acc;
    }, 0);
    return sum;
}

export async function startCommand(ctx, userGroup, userMap, buttonSet, addUser, getGroupsByNotSubscribed, groups, choose) {
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
    choose.set(ctx.from.id, "selectGroup");
}

export async function chooseMonth(ctx, choose, userGroup, groupText, sendMSG, addSubscription) {
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
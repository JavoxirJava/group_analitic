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
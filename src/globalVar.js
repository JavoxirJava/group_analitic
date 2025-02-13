import { getAllGroups, getAllUsers } from './database/controller.js';

export let groupMap = new Map();
export let userMap = new Map();
export const check = ["taksi     kerak", "odam bor", "pochta bor"];

export const loadGroupsAndUsers = async () => {
    const groups = await getAllGroups();
    const users = await getAllUsers();
    console.log(groups[0]?.id, typeof groups[0]?.id); // id va uning turini tekshirish
    if (users) users.forEach(user => userMap.set(BigInt(user.id), user));
    if (groups) groups.forEach(group => groupMap.set(BigInt(group.id), group));    
};
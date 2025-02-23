import { getAllGroups, getAllUsers } from './database/controller.js';

export let groups = [];
export let groupMap = new Map();
export let userMap = new Map();
export const check = ["taksi kerak", "odam bor", "pochta bor"];
export const oneDay = 24 * 60 * 60 * 1000;

export const loadGroupsAndUsers = async () => {
    groups = await getAllGroups();
    const users = await getAllUsers();
    if (users) users.forEach(user => userMap.set(BigInt(user.id), user));
    if (groups) groups.forEach(group => groupMap.set(BigInt(group.id), group));    
};
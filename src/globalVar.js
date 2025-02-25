import { getAllGroups, getAllUsers } from './database/controller.js';

export const ADMIN_ID = 1085241246;
export let groups = [];
export let groupMap = new Map();
export let userMap = new Map();
export const check = ["taksi kerak", "odam bor", "pochta bor"];
export const oneDay = 24 * 60 * 60 * 1000;
let taskCount = 1;
export const increment = () => taskCount++;

export const loadGroupsAndUsers = async () => {
    groups = await getAllGroups();
    const users = await getAllUsers();
    if (users) users.forEach(user => userMap.set(BigInt(user.id), user));
    if (groups) groups.forEach(group => groupMap.set(BigInt(group.id), group));    
};
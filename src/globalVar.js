import { getAllGroups, getAllUsers } from './database/controller.js';

export let groupMap = new Map();
export let userMap = new Map();
export const check = ["taksi     kerak", "odam bor", "pochta bor"];

(async () => {

    const groups = await getAllGroups();
    const users = await getAllUsers();
    if (groups && users) {
        groups.forEach(group => groupMap.set(group.id, group));
        users.forEach(user => userMap.set(user.id, user));
    }
})();
import db from './db.js';

// 1. **Users CRUD**
export const addUser = async (id, username, fullName) => {
    return await db.query(`
        INSERT INTO users (id, username, full_name)
        VALUES ($1, $2, $3)
        RETURNING id, username, full_name, registration_date;
        `, [id, username, fullName]);
};

export const getAllUsers = async () => {
    const res = await db.query('SELECT * FROM users');
    return res.rows;
};

export const getUserById = async (userId) => {
    const res = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
    return res.rows[0];
};

export const deleteUser = async (userId) => {
    const res = await db.query('DELETE FROM users WHERE id = $1 RETURNING id', [userId]);
    return res.rows[0];
};

// 2. **Groups CRUD**
export const addGroup = async (id, groupName, price, description) => {
    return await db.query(`
        INSERT INTO groups (id, group_name, price, description)
        VALUES ($1, $2, $3, $4)
        RETURNING id, group_name, price, description, created_at;
    `, [id, groupName, price, description]);
};

export const getAllGroups = async () => {
    const res = await db.query('SELECT * FROM groups');
    return res.rows;
};

export const getGroupById = async (groupId) => {
    const res = await db.query('SELECT * FROM groups WHERE id = $1', [groupId]);
    return res.rows[0];
};

export const updateGroup = async (groupId, groupName, price, description) => {
    const res = await db.query(`
        UPDATE groups SET group_name = $1, price = $2, description = $3 WHERE id = $4
        RETURNING id, group_name, price, description, created_at;
    `, [groupName, price, description, groupId]);
    return res.rows[0];
};

export const deleteGroup = async (groupId) => {
    const res = await db.query('DELETE FROM groups WHERE id = $1 RETURNING id', [groupId]);
    return res.rows[0];
};

// 3. **Subscriptions CRUD**
export const addSubscription = async (userId, groupId, durationMonths) => {
    return await db.query(`
        INSERT INTO subscriptions (user_id, group_id, duration_months)
        VALUES ($1, $2, $3)
        RETURNING id, user_id, group_id, duration_months, start_date, end_date, payment_completed;
    `, [userId, groupId, durationMonths]).rows[0];
};

export const deleteSubscription = async (subscriptionId) => {
    return await db.query(`
        DELETE FROM subscriptions WHERE id = $1
        RETURNING id, user_id, group_id, duration_months, start_date, end_date, payment_completed;
    `, [subscriptionId]).rows[0];
};

export const getAllSubscriptionsFull = async () => {
    return await db.query(`
        SELECT s.id, s.user_id, s.group_id, s.duration_months, s.start_date, s.end_date, s.payment_completed,
        u.username, u.full_name, g.group_name, g.price, g.description
        FROM subscriptions s
        INNER JOIN users u ON s.user_id = u.id
        INNER JOIN groups g ON s.group_id = g.id;
    `).rows;
};

export const getAllSubscriptions = async () => {
    return await db.query('SELECT * FROM subscriptions').rows;
};

export const getSubscriptionByUserId = async (userId) => {
    return await db.query('SELECT * FROM subscriptions WHERE user_id = $1', [userId]).rows;
};

export const getSubscriptionByGroupId = async (groupId) => {
    const res = await db.query('SELECT * FROM subscriptions WHERE group_id = $1', [groupId]);
    return res.rows;
};
import db from './db.js';

// 1. **Users CRUD**
export const addUser = async (id, username, fullName) => {
    const result = await db.query(`
        INSERT INTO users (id, username, full_name)
        VALUES ($1, $2, $3)
        RETURNING id, username, full_name, registration_date;
        `, [id, username, fullName]);
    return result.rows[0];
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
    const result = await db.query(
        `INSERT INTO groups (id, group_name, price, description)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (id) DO NOTHING
         RETURNING id, group_name, price, description, created_at`,
        [id, groupName, price, description]
    );
    if (result.rows.length > 0) return result.rows[0];
    const existingGroup = await db.query(
        "SELECT id, group_name, price, description, created_at FROM groups WHERE id = $1",
        [id]
    );
    return existingGroup.rows[0];
};

export const getAllGroups = async () => {
    const res = await db.query('SELECT * FROM groups');
    return res.rows;
};

export const getGroupsByNotSubscribed = async (userId) => {
    const res = await db.query(`
        SELECT g.*
        FROM groups g
        LEFT JOIN subscriptions s 
            ON g.id = s.group_id 
            AND s.user_id = $1 
            AND s.payment_completed = TRUE
        WHERE s.group_id IS NULL;
    `, [userId]);
    return res.rows;
}

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
    const res = await db.query(`
        INSERT INTO subscriptions (user_id, group_id, duration_months)
        VALUES ($1, $2, $3)
        RETURNING id, user_id, group_id, duration_months, start_date, end_date, payment_completed;
    `, [userId, groupId, durationMonths]);
    return res.rows[0];
};

export const editStatus = async (id, status) => {
    const res = await db.query(`
        UPDATE subscriptions SET payment_completed = $1 WHERE id = $2
        RETURNING id, user_id, group_id, duration_months, start_date, end_date, payment_completed;
    `, [status, id]);
    return res.rows[0];
};

export const deleteSubscription = async (id) => {
    return await db.query(`
        DELETE FROM subscriptions WHERE id = $1
        RETURNING id, user_id, group_id, duration_months, start_date, end_date, payment_completed;
    `, [id]).rows[0];
};

export const getAllSubscriptionsFull = async () => {
    const res = await db.query(`
        SELECT s.id, s.user_id, s.group_id, s.duration_months, s.start_date, s.end_date, s.payment_completed,
        u.username, u.full_name, g.group_name, g.price, g.description
        FROM subscriptions s
        INNER JOIN users u ON s.user_id = u.id
        INNER JOIN groups g ON s.group_id = g.id;
    `);
    return res.rows;
};

export const getAllSubscriptions = async (status) => {
    const res = await db.query('SELECT * FROM subscriptions WHERE payment_completed = $1', [status]);
    return res.rows;
};

export const getSubscriptionByUserId = async (userId) => {
    const res = await db.query('SELECT * FROM subscriptions WHERE user_id = $1 and payment_completed = true', [userId]);
    return res.rows;
};

export const getSubscriptionByGroupId = async (groupId) => {
    const res = await db.query('SELECT * FROM subscriptions WHERE group_id = $1 and payment_completed = true', [groupId]);
    return res.rows;
};
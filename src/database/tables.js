export const createTables = async (client) => {
    try {
        // Users jadvali
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id BIGINT PRIMARY KEY,
                username VARCHAR(255),
                full_name VARCHAR(255),
                registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            `);
        console.log("Users jadvali yaratildi!");

        // Groups jadvali
        await client.query(`
            CREATE TABLE IF NOT EXISTS groups (
                id BIGINT PRIMARY KEY,
                group_name VARCHAR(255) NOT NULL,
                price NUMERIC(10, 2) NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            `);
        console.log("Groups jadvali yaratildi!");

        // Subscriptions jadvali
        await client.query(`
            CREATE TABLE IF NOT EXISTS subscriptions (
                id SERIAL PRIMARY KEY,
                user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
                group_id BIGINT REFERENCES groups(id) ON DELETE CASCADE,
                duration_months INT NOT NULL,
                start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                end_date TIMESTAMP,
                payment_completed BOOLEAN DEFAULT FALSE
            );
            `);
        console.log("Subscriptions jadvali yaratildi!");
    } catch (err) {
        console.error('Jadval yaratishda xato:', err.stack);
    }
};
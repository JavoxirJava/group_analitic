export const createTables = async (client) => {
    try {
        await client.query(`DROP SCHEMA public CASCADE; CREATE SCHEMA public;`);
        console.log("✅ Barcha jadvallar o‘chirildi va toza schema yaratildi.");

        // Users jadvali
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id BIGINT PRIMARY KEY,
                username VARCHAR(255),
                full_name VARCHAR(255),
                registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS groups (
                id BIGINT PRIMARY KEY,
                group_name VARCHAR(255) NOT NULL,
                price NUMERIC(10, 2) NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS subscriptions (
                id SERIAL PRIMARY KEY,
                user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                group_id BIGINT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
                duration_months INT NOT NULL CHECK (duration_months > 0),
                start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                end_date TIMESTAMP,  -- BU YERDA DEFAULT YO‘Q!
                payment_completed BOOLEAN DEFAULT FALSE
            );

            -- TRIGGER FUNKSIYA YARATISH
            CREATE OR REPLACE FUNCTION set_end_date()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.end_date := NEW.start_date + (NEW.duration_months * INTERVAL '1 month');
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;

            -- TRIGGER O‘RNATISH
            CREATE TRIGGER trigger_set_end_date
            BEFORE INSERT ON subscriptions
            FOR EACH ROW
            EXECUTE FUNCTION set_end_date();
        `);
        console.log("✅ Barcha jadvallar yaratildi.");
    } catch (err) {
        console.error('Jadval yaratishda xato:', err.stack);
    }
};
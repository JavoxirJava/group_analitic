import pkg from 'pg';
const { Client } = pkg;
// const { createTables } = require('./tables');

const db = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'root123',
    database: 'group_bot',
});

db.connect()
    .then(() => console.log("PostgreSQL bazasiga ulanish muvaffaqiyatli!"))
    .catch((err) => console.error('Ulanishda xato:', err.stack));

export default db;
// createTables(client);

process.on('exit', () => {
    db.end();
});

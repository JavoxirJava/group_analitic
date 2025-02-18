import chalk from 'chalk';
import pkg from 'pg';
import env from 'dotenv';

env.config();

const { Client } = pkg;

const db = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
});

db.connect()
    .then(() => console.log(chalk.blue("🗄 => PostgreSQL bazasiga ulanish muvaffaqiyatli!")))
    .catch((err) => console.error('Ulanishda xato:', err.stack));

export default db;

process.on('exit', () => {
    db.end();
});

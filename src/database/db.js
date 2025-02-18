import chalk from 'chalk';
import pkg from 'pg';

const { Client } = pkg;

const db = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'root123',
    database: 'group_bot',
});

db.connect()
    .then(() => console.log(chalk.blue("🗄 => PostgreSQL bazasiga ulanish muvaffaqiyatli!")))
    .catch((err) => console.error('Ulanishda xato:', err.stack));

export default db;

process.on('exit', () => {
    db.end();
});

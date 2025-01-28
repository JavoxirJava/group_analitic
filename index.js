const MTProto = require('@mtproto/core');
const readline = require('readline');
const path = require('path');
const fs = require('fs');

// Sessiya fayli uchun yo'lni aniqlash
const sessionFilePath = path.resolve(__dirname, './data/session.json');

// Agar "data" katalogi mavjud bo'lmasa, uni yarating
const sessionDir = path.dirname(sessionFilePath);
if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir);
}

// MTProto mijozini yaratish
const mtproto = new MTProto({
    api_id: 27394255, // O'zingizning API ID
    api_hash: '439b82a304af3de333e8004acb53a82d', // O'zingizning API Hash
    storageOptions: {
        path: sessionFilePath, // Sessiya ma'lumotlari uchun fayl yo'li
    },
});

// Terminal orqali foydalanuvchi kiritishini tashkil qilish
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// Kodni yuborish va autentifikatsiya qilish
async function start() {
    try {
        // Telefon raqamiga kod yuborish
        const result = await mtproto.call('auth.sendCode', {
            phone_number: '+998938188177', // Telefon raqamingiz
            settings: { _: 'codeSettings' },
        });

        console.log('Telefoningizga kod yuborildi.');

        // Terminal orqali foydalanuvchidan kodni olish
        rl.question('Telefoningizga kelgan kodni kiriting: ', async (phoneCode) => {
            try {
                // Kirgan kodni tekshirish va tizimga kirish
                const signInResult = await mtproto.call('auth.signIn', {
                    phone_number: '+998938188177', // Telefon raqamingiz
                    phone_code_hash: result.phone_code_hash, // Kod yuborilganda qaytarilgan hash
                    phone_code: phoneCode, // Terminal orqali kiritilgan kod
                });

                console.log('Muvaffaqiyatli tizimga kirdingiz:', signInResult);
                rl.close(); // Terminal sessiyasini yopish
            } catch (error) {
                if (error.error_message === 'SESSION_PASSWORD_NEEDED') {
                    // Agar SESSION_PASSWORD_NEEDED xatosi bo'lsa, foydalanuvchidan parolni so'rang
                    console.log('Ikki faktorli autentifikatsiya uchun parol kiritishingiz kerak.');

                    let passwordAttempts = 0;

                    // Parolni tekshirish va foydalanuvchidan to'g'ri parolni olish
                    function requestPassword() {
                        rl.question('Parolni kiriting: ', async (password) => {
                            try {
                                const authPassword = await mtproto.call('auth.checkPassword', {
                                    password: await getPasswordHash(password),
                                });
                                console.log('Muvaffaqiyatli tizimga kirdingiz:', authPassword);
                                rl.close(); // Terminal sessiyasini yopish
                            } catch (passwordError) {
                                console.log('Xato:', passwordError);

                                if (passwordAttempts < 3) {
                                    console.log('Parol noto‘g‘ri, iltimos, qayta urinib ko‘ring.');
                                    passwordAttempts++;
                                    requestPassword(); // Yana parolni so'rash
                                } else {
                                    console.error('Ko‘p xatoliklar kiritildi, iltimos, qayta urining.');
                                    rl.close(); // Terminal sessiyasini yopish
                                }
                            }
                        });
                    }

                    // Dastlabki parolni so'rash
                    requestPassword();
                } else {
                    console.error('Kod noto‘g‘ri yoki tizimga kirishda xatolik yuz berdi:', error);
                    rl.close();
                }
            }
        });
    } catch (error) {
        console.error('Xato yuz berdi:', error);
    }
}

// Parolning hashini olish funksiyasi
async function getPasswordHash(password) {
    const { srp_id, current_algo, srp_B } = await mtproto.call('account.getPassword');
    const { g, p, salt1, salt2 } = current_algo;

    const Crypto = require('crypto');
    const pwSalted = Buffer.concat([
        Buffer.from(salt1, 'hex'),
        Crypto.createHash('sha256')
            .update(Buffer.concat([Buffer.from(password), Buffer.from(salt2, 'hex')]))
            .digest(),
    ]);

    const gBigInt = BigInt(g);
    const pBigInt = BigInt('0x' + p);

    // Parolga ishlov berish
    const x = BigInt('0x' + Crypto.createHash('sha256').update(pwSalted).digest('hex'));
    const gXModP = gBigInt ** x % pBigInt;

    const u = BigInt(
        '0x' +
        Crypto.createHash('sha256')
            .update(Buffer.concat([Buffer.from(gXModP.toString(16), 'hex'), Buffer.from(srp_B, 'hex')]))
            .digest('hex'),
    );

    const k = BigInt(
        '0x' +
        Crypto.createHash('sha256')
            .update(Buffer.concat([Buffer.from(p, 'hex'), Buffer.from([g])]))
            .digest('hex'),
    );

    const s = BigInt('0x' + srp_B) - k * (gBigInt ** x % pBigInt);
    const sModP = (s ** (BigInt(u) * x + x)) % pBigInt;

    // Hashni qaytarish
    return Crypto.createHash('sha256').update(Buffer.from(sModP.toString(16), 'hex')).digest('hex');
}


start();

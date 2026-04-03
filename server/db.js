const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Veritabanı dosyası server klasöründe oblivion.db olarak oluşturulacak
const dbPath = path.resolve(__dirname, 'oblivion.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Veritabanı bağlantı hatası:', err.message);
    } else {
        console.log('Karanlık arşive (SQLite) bağlanıldı.');
    }
});

// Tabloları oluştur
db.serialize(() => {
    // Kullanıcılar Tablosu
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Lisanslar Tablosu (Key'ler için)
    db.run(`CREATE TABLE IF NOT EXISTS licenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        license_key TEXT UNIQUE NOT NULL,
        user_id INTEGER,
        plan_type TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        expires_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    console.log('Veritabanı tabloları hazır.');
});

module.exports = db;

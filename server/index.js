const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const db = require('./db.js');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.JWT_SECRET || 'OBLIVION_DARK_PREMIUM_SECRET_1337';

// --- RATE LIMITERS (GÜVENLİK) ---
// Giriş Yapma - Maksimum 5 deneme / 15 dakika
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 5, 
    message: { error: 'Çok fazla giriş denemesi yaptınız. Lütfen 15 dakika sonra tekrar deneyin.' }
});

// Kayıt Olma - Maksimum 3 hesap / 1 saat
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: { error: 'Çok fazla kayıt işlemi gerçekleştirdiniz. Lütfen 1 saat sonra tekrar deneyin.' }
});

// Key Üretme - Admin bile olsa Maksimum 10 key / 5 dakika (Spam veya script engelleme)
const generateKeyLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 10,
    message: { error: 'Çok hızlı key üretiyorsunuz. Lütfen 5 dakika bekleyin.' }
});

// --- JWT GÜVENLİK (MIDDLEWARE) ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) return res.status(401).json({ error: 'Erişim reddedildi. Token eksik.' });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: 'Geçersiz veya süresi dolmuş token.' });
        req.user = user;
        next();
    });
};

const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Bu işlem için yetkiniz yok. (Sadece Admin)' });
    }
    next();
};

// --- KULLANICI İŞLEMLERİ (AUTH) ---

app.post('/api/auth/register', registerLimiter, async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: 'Tüm alanları doldurun.' });

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Artık tüm yeni kayıtlar sadece standart kullanıcı (user) olacak.
        const role = 'user';
        
        const sql = `INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`;
        db.run(sql, [username, email, hashedPassword, role], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ error: 'Kullanıcı adı veya e-posta kullanımda.' });
                }
                return res.status(500).json({ error: 'Veritabanı hatası.' });
            }
            res.status(201).json({ 
                message: 'Kayıt başarılı.', 
                role: role
            });
        });
    } catch (err) {
        res.status(500).json({ error: 'Sunucu hatası.' });
    }
});

app.post('/api/auth/login', loginLimiter, (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Kullanıcı adı ve şifre gereklidir.' });

    const sql = `SELECT * FROM users WHERE username = ?`;
    db.get(sql, [username], async (err, user) => {
        if (err) return res.status(500).json({ error: 'Veritabanı hatası.' });
        if (!user) return res.status(400).json({ error: 'Kullanıcı bulunamadı.' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ error: 'Hatalı şifre.' });

        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET_KEY, { expiresIn: '24h' });
        res.json({ message: 'Giriş başarılı.', token, user: { id: user.id, username: user.username, role: user.role } });
    });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
    res.json({ user: req.user });
});

// --- LİSANS (KEY) SİSTEMİ ---

const generateLicenseKey = () => {
    const segments = [];
    for (let i = 0; i < 4; i++) {
        segments.push(crypto.randomBytes(2).toString('hex').toUpperCase());
    }
    return segments.join('-');
};

app.post('/api/license/redeem', authenticateToken, (req, res) => {
    const { license_key } = req.body;
    const user_id = req.user.id;

    if (!license_key) return res.status(400).json({ error: 'Lisans anahtarı gereklidir.' });

    db.get(`SELECT * FROM licenses WHERE license_key = ?`, [license_key], (err, license) => {
        if (err) return res.status(500).json({ error: 'Veritabanı hatası.' });
        if (!license) return res.status(404).json({ error: 'Geçersiz lisans anahtarı.' });
        if (license.user_id) return res.status(400).json({ error: 'Bu anahtar zaten kullanılmış.' });
        if (license.status !== 'active') return res.status(400).json({ error: 'Lisans aktif değil.' });

        db.run(`UPDATE licenses SET user_id = ? WHERE license_key = ?`, [user_id, license_key], function(err) {
             if (err) return res.status(500).json({ error: 'Lisans etkinleştirilemedi.' });
             res.json({ message: 'Lisans başarıyla hesabınıza eklendi.' });
        });
    });
});

// --- ADMİN PANELİ (SADECE ADMİNLER) ---

// Tüm kullanıcıları getir
app.get('/api/admin/users', authenticateToken, requireAdmin, (req, res) => {
    db.all(`SELECT id, username, email, role, created_at FROM users`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Veritabanı hatası.' });
        res.json({ users: rows });
    });
});

// Tüm lisansları getir
app.get('/api/admin/licenses', authenticateToken, requireAdmin, (req, res) => {
    db.all(`SELECT * FROM licenses`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Veritabanı hatası.' });
        res.json({ licenses: rows });
    });
});

// Yeni lisans anahtarı üret
app.post('/api/admin/generate-key', authenticateToken, requireAdmin, generateKeyLimiter, (req, res) => {
    const { plan_type, expires_at } = req.body; 
    if (!plan_type) return res.status(400).json({ error: 'Plan türü gereklidir.' });

    const key = generateLicenseKey();
    db.run(`INSERT INTO licenses (license_key, plan_type, expires_at) VALUES (?, ?, ?)`, [key, plan_type, expires_at], function(err) {
        if (err) return res.status(500).json({ error: 'Lisans oluşturulamadı.' });
        res.status(201).json({ message: 'Lisans başarıyla üretildi.', key });
    });
});

// Lisans anahtarı sil
app.delete('/api/admin/licenses/:id', authenticateToken, requireAdmin, (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM licenses WHERE id = ?`, [id], function(err) {
        if (err) return res.status(500).json({ error: 'Lisans silinemedi.' });
        res.json({ message: 'Lisans başarıyla silindi.' });
    });
});

// --- OTOMATİK ÖDEME ENTEGRASYONU (SELLIX WEBHOOK) ---
// Bir müşteri Sellix üzerinden kripto veya kart ile ödeme yaptığında bu uç nokta (endpoint) tetiklenir.
app.post('/api/webhooks/sellix', (req, res) => {
    // Gerçek bir senaryoda Sellix'in imzasını (signature) doğrulamamız gerekir (crypto.createHmac).
    const payload = req.body;
    
    // Sellix sipariş tamamlandı durumu
    if (payload.event !== 'order:paid') {
        return res.status(400).json({ message: 'Sadece ödenen siparişler işlenir.' });
    }

    const customFields = payload.data.custom_fields || {};
    // Ürüne göre plan tipini belirleme (örneğin Sellix product ID'sine göre)
    const plan_type = payload.data.product_title.toLowerCase().includes('lifetime') ? 'lifetime' : 'monthly';
    
    // Otomatik anahtar üret
    const key = generateLicenseKey();
    
    // Veritabanına kaydet
    db.run(`INSERT INTO licenses (license_key, plan_type) VALUES (?, ?)`, [key, plan_type], function(err) {
        if (err) {
            console.error('Webhook lisans oluşturma hatası:', err);
            return res.status(500).json({ error: 'Veritabanı hatası' });
        }
        
        console.log(`[SELLIX WEBHOOK] Yeni ödeme alındı! Üretilen Lisans: ${key} | Plan: ${plan_type}`);
        
        // Sellix, müşteriye bu anahtarı e-posta ile otomatik iletecektir (veya sipariş sonrası ekranda gösterir).
        res.status(200).json({ 
            message: 'Ödeme alındı ve lisans üretildi.',
            delivered_key: key 
        });
    });
});

app.listen(PORT, () => {
    console.log(`Oblivion Sunucusu Ayakta: ${PORT} portunda dinleniyor.`);
});

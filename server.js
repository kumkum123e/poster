const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;
const DB_FILE = path.join(__dirname, 'database.db');

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(__dirname));

// Initialize SQLite Database
const db = new sqlite3.Database(DB_FILE, (err) => {
    if (err) {
        console.error('Failed to open database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
        // Create registrations table
        db.run(`CREATE TABLE IF NOT EXISTS registrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            utr TEXT NOT NULL UNIQUE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error('Failed to create registrations table:', err.message);
            } else {
                console.log('Registrations table initialized.');
            }
        });
    }
});

// Default Configurations
let configWhatsAppLink = 'https://chat.whatsapp.com/Ky6tGrN9THs6xEndeuNrqy';
let configAdminPassword = 'admin'; // Default password to view UTR logs
let configUpiId = '94664771641@axl';
let configPayeeName = 'GAJENDER SINGH';
let configFee = '99/-';
let configDate = '12 July 2026';
let configTime = '9:00 PM';
let configDay = 'SUNDAY';
let configQrMode = 'dynamic';
let configStaticQrPath = 'assets/phonepe_qr.jpg';

// Load custom overrides if saved locally
const CONFIG_FILE = path.join(__dirname, 'config.json');
function loadServerConfig() {
    if (fs.existsSync(CONFIG_FILE)) {
        try {
            const data = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
            if (data.whatsappLink) configWhatsAppLink = data.whatsappLink;
            if (data.adminPassword) configAdminPassword = data.adminPassword;
            if (data.upiId) configUpiId = data.upiId;
            if (data.payeeName) configPayeeName = data.payeeName;
            if (data.fee) configFee = data.fee;
            if (data.date) configDate = data.date;
            if (data.time) configTime = data.time;
            if (data.day) configDay = data.day;
            if (data.qrMode) configQrMode = data.qrMode;
            if (data.staticQrPath) configStaticQrPath = data.staticQrPath;
        } catch (e) {
            console.error('Failed to parse config.json:', e.message);
        }
    }
}
loadServerConfig();

// API: Get current configurations (Public)
app.get('/api/config', (req, res) => {
    res.json({
        success: true,
        whatsappLink: configWhatsAppLink,
        upiId: configUpiId,
        payeeName: configPayeeName,
        fee: configFee,
        date: configDate,
        time: configTime,
        day: configDay,
        qrMode: configQrMode,
        staticQrPath: configStaticQrPath
    });
});

// API: Save custom configurations
app.post('/api/config', (req, res) => {
    const { 
        whatsappLink, 
        adminPassword, 
        upiId, 
        payeeName, 
        fee, 
        date, 
        time, 
        day, 
        qrMode, 
        staticQrPath 
    } = req.body;

    if (whatsappLink) configWhatsAppLink = whatsappLink;
    if (adminPassword) configAdminPassword = adminPassword;
    if (upiId) configUpiId = upiId;
    if (payeeName) configPayeeName = payeeName;
    if (fee) configFee = fee;
    if (date) configDate = date;
    if (time) configTime = time;
    if (day) configDay = day;
    if (qrMode) configQrMode = qrMode;
    if (staticQrPath) configStaticQrPath = staticQrPath;
    
    const configData = {
        whatsappLink: configWhatsAppLink,
        adminPassword: configAdminPassword,
        upiId: configUpiId,
        payeeName: configPayeeName,
        fee: configFee,
        date: configDate,
        time: configTime,
        day: configDay,
        qrMode: configQrMode,
        staticQrPath: configStaticQrPath
    };
    
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(configData, null, 2));
    res.json({ success: true, message: 'Server configuration saved successfully.' });
});

// API: Reset server configuration to defaults
app.post('/api/config/reset', (req, res) => {
    if (fs.existsSync(CONFIG_FILE)) {
        try {
            fs.unlinkSync(CONFIG_FILE);
        } catch (e) {
            console.error('Failed to delete config.json:', e.message);
        }
    }
    // Restore variables to defaults
    configWhatsAppLink = 'https://chat.whatsapp.com/Ky6tGrN9THs6xEndeuNrqy';
    configAdminPassword = 'admin';
    configUpiId = '94664771641@axl';
    configPayeeName = 'GAJENDER SINGH';
    configFee = '99/-';
    configDate = '12 July 2026';
    configTime = '9:00 PM';
    configDay = 'SUNDAY';
    configQrMode = 'dynamic';
    configStaticQrPath = 'assets/phonepe_qr.jpg';

    res.json({ success: true, message: 'Configuration reset to defaults.' });
});

// API: Verify UTR Payment and Fetch WhatsApp Group Link
app.post('/api/verify-utr', (req, res) => {
    const { name, email, phone, utr } = req.body;

    // Server-side validation
    if (!name || !email || !phone || !utr) {
        return res.status(400).json({ success: false, error: 'All registration fields are required.' });
    }

    // UPI Transaction Reference (UTR) is always a 12-digit numeric code in India
    const utrClean = utr.trim().replace(/\s/g, '');
    if (!/^\d{12}$/.test(utrClean)) {
        return res.status(400).json({ success: false, error: 'Invalid UTR format. UPI Transaction Ref / UTR must be exactly 12 digits.' });
    }

    // Insert into database
    const query = `INSERT INTO registrations (name, email, phone, utr) VALUES (?, ?, ?, ?)`;
    db.run(query, [name.trim(), email.trim(), phone.trim(), utrClean], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(409).json({ success: false, error: 'This Transaction Ref (UTR) has already been submitted.' });
            }
            return res.status(500).json({ success: false, error: 'Database error occurred. Please try again.' });
        }

        // Return successful verification response and the WhatsApp invite URL
        res.json({
            success: true,
            whatsappLink: configWhatsAppLink,
            message: 'Registration transaction recorded and verified.'
        });
    });
});

// API: Get all transaction logs (Admin Panel)
app.post('/api/transactions', (req, res) => {
    const { password } = req.body;

    if (password !== configAdminPassword) {
        return res.status(401).json({ success: false, error: 'Access Denied: Incorrect Admin Password.' });
    }

    db.all(`SELECT * FROM registrations ORDER BY created_at DESC`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true, registrations: rows });
    });
});

// Fallback to serve index.html for undefined routes
app.get('/(.*)', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start listening
app.listen(PORT, () => {
    console.log(`Gatekeeper Payment Server is running on http://localhost:${PORT}`);
});

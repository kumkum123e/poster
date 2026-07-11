const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(__dirname));

// Default Configurations
let configWhatsAppLink = 'https://chat.whatsapp.com/Ky6tGrN9THs6xEndeuNrqy';

// Load custom overrides if saved locally
const CONFIG_FILE = path.join(__dirname, 'config.json');
function loadServerConfig() {
    if (fs.existsSync(CONFIG_FILE)) {
        try {
            const data = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
            if (data.whatsappLink) configWhatsAppLink = data.whatsappLink;
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
        whatsappLink: configWhatsAppLink
    });
});

// API: Save custom configurations
app.post('/api/config', (req, res) => {
    const { whatsappLink } = req.body;

    if (whatsappLink) {
        configWhatsAppLink = whatsappLink;
        const configData = { whatsappLink: configWhatsAppLink };
        try {
            fs.writeFileSync(CONFIG_FILE, JSON.stringify(configData, null, 2));
            return res.json({ success: true, message: 'Server configuration saved successfully.' });
        } catch (err) {
            return res.status(500).json({ success: false, error: 'Failed to write configuration file.' });
        }
    }
    res.status(400).json({ success: false, error: 'whatsappLink is required.' });
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
    res.json({ success: true, message: 'Configuration reset to defaults.' });
});

// Fallback to serve index.html for undefined routes
app.get('/(.*)', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start listening
app.listen(PORT, () => {
    console.log(`WhatsApp Link Server is running on http://localhost:${PORT}`);
});

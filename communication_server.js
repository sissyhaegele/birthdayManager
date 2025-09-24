// communication_server.js - Multi-Channel Kommunikations-Server
// Läuft auf Port 3002 und arbeitet mit dem Haupt-DB-Server zusammen

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.COMM_PORT || 3002;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Verbindung zur bestehenden Datenbank
const db = new sqlite3.Database('birthday_manager.db');

// ========================================
// DATENBANK-SCHEMA FÜR KOMMUNIKATION
// ========================================
db.serialize(() => {
    // Kommunikations-Konfiguration pro Bereich
    db.run(`CREATE TABLE IF NOT EXISTS group_channels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        group_name TEXT UNIQUE NOT NULL,
        whatsapp_enabled BOOLEAN DEFAULT 0,
        whatsapp_group_id TEXT,
        whatsapp_type TEXT DEFAULT 'group', -- 'group', 'broadcast', 'individual'
        email_enabled BOOLEAN DEFAULT 0,
        email_addresses TEXT, -- Kommagetrennte Liste
        email_from TEXT,
        telegram_enabled BOOLEAN DEFAULT 0,
        telegram_chat_id TEXT,
        telegram_bot_token TEXT,
        sms_enabled BOOLEAN DEFAULT 0,
        sms_numbers TEXT, -- Kommagetrennte Liste
        webhook_enabled BOOLEAN DEFAULT 0,
        webhook_url TEXT,
        auto_send_morning BOOLEAN DEFAULT 0,
        auto_send_weekly BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Kommunikations-Log
    db.run(`CREATE TABLE IF NOT EXISTS communication_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        group_name TEXT,
        channel TEXT,
        status TEXT,
        recipients TEXT,
        message TEXT,
        error_message TEXT,
        sent_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Standard-Konfigurationen für bestehende Gruppen
    db.all("SELECT name FROM groups", (err, groups) => {
        if (!err && groups) {
            groups.forEach(group => {
                db.run(
                    "INSERT OR IGNORE INTO group_channels (group_name) VALUES (?)",
                    [group.name]
                );
            });
        }
    });

    console.log('✓ Kommunikations-Tabellen erstellt/aktualisiert');
});

// ========================================
// E-MAIL KONFIGURATION
// ========================================
let emailTransporter = null;

function setupEmailTransporter(config) {
    try {
        if (config && config.user && config.pass) {
            emailTransporter = nodemailer.createTransporter({
                service: config.service || 'gmail',
                auth: {
                    user: config.user,
                    pass: config.pass // App-spezifisches Passwort bei Gmail
                }
            });
            console.log('✓ E-Mail Transporter konfiguriert');
            return true;
        }
    } catch (error) {
        console.error('✗ E-Mail Konfiguration fehlgeschlagen:', error.message);
    }
    return false;
}

// Lade E-Mail Config aus Umgebungsvariablen oder Datei
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    setupEmailTransporter({
        service: process.env.EMAIL_SERVICE || 'gmail',
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    });
}

// ========================================
// API ENDPOINTS
// ========================================

// GET - Alle Gruppen mit Kommunikations-Konfiguration
app.get('/api/communication/groups', (req, res) => {
    db.all(`
        SELECT 
            g.name,
            gc.*,
            COUNT(DISTINCT pg.person_id) as person_count
        FROM groups g
        LEFT JOIN group_channels gc ON g.name = gc.group_name
        LEFT JOIN person_groups pg ON g.id = pg.group_id
        GROUP BY g.id, g.name
        ORDER BY g.name
    `, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// GET - Konfiguration für eine Gruppe
app.get('/api/communication/group/:groupName', (req, res) => {
    const { groupName } = req.params;
    
    db.get(
        "SELECT * FROM group_channels WHERE group_name = ?",
        [groupName],
        (err, row) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            if (!row) {
                // Erstelle Standard-Konfiguration
                db.run(
                    "INSERT INTO group_channels (group_name) VALUES (?)",
                    [groupName],
                    function(err) {
                        if (err) {
                            res.status(500).json({ error: err.message });
                            return;
                        }
                        res.json({
                            id: this.lastID,
                            group_name: groupName,
                            whatsapp_enabled: false,
                            email_enabled: false,
                            telegram_enabled: false,
                            sms_enabled: false,
                            webhook_enabled: false
                        });
                    }
                );
            } else {
                res.json(row);
            }
        }
    );
});

// POST - Konfiguration für eine Gruppe speichern
app.post('/api/communication/group/:groupName', (req, res) => {
    const { groupName } = req.params;
    const config = req.body;
    
    db.run(
        `INSERT OR REPLACE INTO group_channels 
         (group_name, whatsapp_enabled, whatsapp_group_id, whatsapp_type,
          email_enabled, email_addresses, email_from,
          telegram_enabled, telegram_chat_id, telegram_bot_token,
          sms_enabled, sms_numbers,
          webhook_enabled, webhook_url,
          auto_send_morning, auto_send_weekly,
          updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [
            groupName,
            config.whatsapp_enabled ? 1 : 0,
            config.whatsapp_group_id || null,
            config.whatsapp_type || 'group',
            config.email_enabled ? 1 : 0,
            config.email_addresses || null,
            config.email_from || null,
            config.telegram_enabled ? 1 : 0,
            config.telegram_chat_id || null,
            config.telegram_bot_token || null,
            config.sms_enabled ? 1 : 0,
            config.sms_numbers || null,
            config.webhook_enabled ? 1 : 0,
            config.webhook_url || null,
            config.auto_send_morning ? 1 : 0,
            config.auto_send_weekly ? 1 : 0
        ],
        function(err) {
            if (err) {
                res.status(400).json({ error: err.message });
                return;
            }
            res.json({ 
                success: true,
                group_name: groupName,
                changes: this.changes
            });
        }
    );
});

// POST - Nachricht an Gruppe senden (über alle konfigurierten Kanäle)
app.post('/api/communication/send/:groupName', async (req, res) => {
    const { groupName } = req.params;
    const { message, subject = 'Birthday Manager Nachricht', test = false } = req.body;
    
    // Hole Konfiguration
    db.get(
        "SELECT * FROM group_channels WHERE group_name = ?",
        [groupName],
        async (err, config) => {
            if (err || !config) {
                res.status(404).json({ error: 'Gruppe nicht gefunden oder nicht konfiguriert' });
                return;
            }
            
            const results = [];
            
            // 1. WhatsApp
            if (config.whatsapp_enabled && config.whatsapp_group_id) {
                try {
                    const response = await fetch('http://localhost:9999/send-group', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            message: message,
                            bereich: groupName,
                            groupId: config.whatsapp_group_id,
                            type: config.whatsapp_type || 'group'
                        })
                    });
                    
                    if (response.ok) {
                        results.push({ 
                            channel: 'whatsapp', 
                            status: 'sent',
                            recipients: config.whatsapp_group_id 
                        });
                        logCommunication(groupName, 'whatsapp', 'sent', config.whatsapp_group_id, message, null);
                    } else {
                        throw new Error('WhatsApp Server Fehler');
                    }
                } catch (error) {
                    results.push({ 
                        channel: 'whatsapp', 
                        status: 'failed',
                        error: error.message 
                    });
                    logCommunication(groupName, 'whatsapp', 'failed', config.whatsapp_group_id, message, error.message);
                }
            }
            
            // 2. E-Mail
            if (config.email_enabled && config.email_addresses) {
                const emailResult = await sendEmail(
                    groupName,
                    config.email_addresses,
                    config.email_from,
                    subject,
                    message
                );
                results.push(emailResult);
                logCommunication(
                    groupName, 
                    'email', 
                    emailResult.status, 
                    config.email_addresses, 
                    message, 
                    emailResult.error
                );
            }
            
            // 3. Telegram
            if (config.telegram_enabled && config.telegram_chat_id) {
                const telegramResult = await sendTelegram(
                    config.telegram_chat_id,
                    config.telegram_bot_token,
                    message,
                    groupName
                );
                results.push(telegramResult);
                logCommunication(
                    groupName, 
                    'telegram', 
                    telegramResult.status, 
                    config.telegram_chat_id, 
                    message, 
                    telegramResult.error
                );
            }
            
            // 4. Webhook
            if (config.webhook_enabled && config.webhook_url) {
                const webhookResult = await sendWebhook(
                    config.webhook_url,
                    groupName,
                    message
                );
                results.push(webhookResult);
                logCommunication(
                    groupName, 
                    'webhook', 
                    webhookResult.status, 
                    config.webhook_url, 
                    message, 
                    webhookResult.error
                );
            }
            
            res.json({
                group: groupName,
                message: test ? 'Test-Nachricht' : message,
                results: results
            });
        }
    );
});

// GET - Kommunikations-Log
app.get('/api/communication/log', (req, res) => {
    const limit = req.query.limit || 100;
    const group = req.query.group || null;
    
    let query = "SELECT * FROM communication_log";
    const params = [];
    
    if (group) {
        query += " WHERE group_name = ?";
        params.push(group);
    }
    
    query += " ORDER BY sent_at DESC LIMIT ?";
    params.push(limit);
    
    db.all(query, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// POST - Test-Nachricht senden
app.post('/api/communication/test/:groupName', async (req, res) => {
    const { groupName } = req.params;
    const testMessage = `🔔 TEST-NACHRICHT - Birthday Manager
    
Bereich: ${groupName}
Zeit: ${new Date().toLocaleString('de-DE')}

Dies ist eine Test-Nachricht zur Überprüfung der Kommunikationskanäle.
Wenn Sie diese Nachricht erhalten, funktioniert die Konfiguration!`;
    
    req.body.message = testMessage;
    req.body.test = true;
    
    // Verwende den normalen Send-Endpoint
    app.handle(req, res);
});

// ========================================
// CHANNEL-SPEZIFISCHE FUNKTIONEN
// ========================================

async function sendEmail(groupName, addresses, fromAddress, subject, message) {
    if (!emailTransporter) {
        return { 
            channel: 'email', 
            status: 'failed',
            error: 'E-Mail Service nicht konfiguriert' 
        };
    }
    
    try {
        const mailOptions = {
            from: fromAddress || process.env.EMAIL_USER || 'birthday-manager@localhost',
            to: addresses,
            subject: `${subject} - ${groupName}`,
            text: message,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                  color: white; padding: 20px; border-radius: 10px 10px 0 0; }
                        .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 10px 10px; }
                        .message { background: white; padding: 15px; border-radius: 5px; 
                                   margin: 15px 0; white-space: pre-wrap; }
                        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2>🎂 Birthday Manager</h2>
                            <p>Benachrichtigung für Bereich: ${groupName}</p>
                        </div>
                        <div class="content">
                            <div class="message">${message.replace(/\n/g, '<br>')}</div>
                            <div class="footer">
                                Diese Nachricht wurde automatisch vom Birthday Manager System gesendet.<br>
                                ${new Date().toLocaleString('de-DE')}
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `
        };
        
        const info = await emailTransporter.sendMail(mailOptions);
        
        return { 
            channel: 'email', 
            status: 'sent',
            recipients: addresses,
            messageId: info.messageId
        };
    } catch (error) {
        return { 
            channel: 'email', 
            status: 'failed',
            error: error.message 
        };
    }
}

async function sendTelegram(chatId, botToken, message, groupName) {
    if (!botToken) {
        return { 
            channel: 'telegram', 
            status: 'failed',
            error: 'Telegram Bot Token nicht konfiguriert' 
        };
    }
    
    try {
        const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: `🎂 *Birthday Manager - ${groupName}*\n\n${message}`,
                parse_mode: 'Markdown'
            })
        });
        
        const data = await response.json();
        
        if (data.ok) {
            return { 
                channel: 'telegram', 
                status: 'sent',
                recipients: chatId
            };
        } else {
            throw new Error(data.description || 'Telegram API Fehler');
        }
    } catch (error) {
        return { 
            channel: 'telegram', 
            status: 'failed',
            error: error.message 
        };
    }
}

async function sendWebhook(url, groupName, message) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                source: 'birthday-manager',
                group: groupName,
                message: message,
                timestamp: new Date().toISOString()
            })
        });
        
        if (response.ok) {
            return { 
                channel: 'webhook', 
                status: 'sent',
                recipients: url
            };
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
        return { 
            channel: 'webhook', 
            status: 'failed',
            error: error.message 
        };
    }
}

// ========================================
// HILFSFUNKTIONEN
// ========================================

function logCommunication(groupName, channel, status, recipients, message, error) {
    db.run(
        `INSERT INTO communication_log 
         (group_name, channel, status, recipients, message, error_message) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [groupName, channel, status, recipients, message, error]
    );
}

// ========================================
// AUTOMATISCHE BENACHRICHTIGUNGEN
// ========================================

function checkDailyBirthdays() {
    const now = new Date();
    const hour = now.getHours();
    
    // Nur um 8 Uhr morgens
    if (hour !== 8) return;
    
    console.log('🔔 Prüfe tägliche Geburtstage...');
    
    // Hole heutige Geburtstage gruppiert nach Bereich
    db.all(`
        SELECT 
            g.name as group_name,
            GROUP_CONCAT(p.name || ' (' || 
                (strftime('%Y', 'now') - strftime('%Y', p.birthdate)) || ' Jahre)' 
            ) as birthdays
        FROM people p
        JOIN person_groups pg ON p.id = pg.person_id
        JOIN groups g ON pg.group_id = g.id
        JOIN group_channels gc ON g.name = gc.group_name
        WHERE strftime('%m-%d', p.birthdate) = strftime('%m-%d', 'now')
          AND gc.auto_send_morning = 1
        GROUP BY g.name
    `, async (err, rows) => {
        if (err || !rows) return;
        
        for (const row of rows) {
            const message = `🎂 GEBURTSTAGE HEUTE\n\n${row.birthdays.replace(/,/g, '\n')}\n\nBitte gratulieren!`;
            
            // Sende über alle konfigurierten Kanäle
            await fetch(`http://localhost:${PORT}/api/communication/send/${row.group_name}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message: message,
                    subject: 'Geburtstags-Erinnerung'
                })
            });
        }
    });
}

// Prüfe stündlich
setInterval(checkDailyBirthdays, 60 * 60 * 1000);

// ========================================
// SERVER STARTEN
// ========================================
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════╗
║   Multi-Channel Communication Server          ║
╠════════════════════════════════════════════════╣
║   Port: ${PORT}                                ║
║                                                ║
║   Verfügbare Kanäle:                          ║
║   • WhatsApp (via Port 9999)                  ║
║   • E-Mail (nodemailer)                       ║
║   • Telegram Bot                              ║
║   • Webhook                                   ║
║                                                ║
║   API Endpoints:                              ║
║   GET  /api/communication/groups              ║
║   GET  /api/communication/group/:name         ║
║   POST /api/communication/group/:name         ║
║   POST /api/communication/send/:name          ║
║   POST /api/communication/test/:name          ║
║   GET  /api/communication/log                 ║
╚════════════════════════════════════════════════╝
    `);
    
    // Initial-Check
    checkDailyBirthdays();
});

module.exports = app;

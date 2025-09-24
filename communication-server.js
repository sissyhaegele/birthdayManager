// communication-server.js - WhatsApp & Email Notification Server
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.COMM_PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());

// Datenbank verbinden
const db = new sqlite3.Database('./birthday_manager.db');

console.log(`
╔════════════════════════════════════════════════════════════╗
║         📱 COMMUNICATION SERVER                            ║
╠════════════════════════════════════════════════════════════╣
║                                                             ║
║  WhatsApp & Email Benachrichtigungen                      ║
║                                                             ║
╚════════════════════════════════════════════════════════════╝
`);

// === WHATSAPP INTEGRATION ===
// Simuliert WhatsApp Web - In Production würde man WhatsApp Business API verwenden

function formatWhatsAppMessage(person, daysUntil) {
    const today = new Date();
    const birthdate = new Date(person.birthdate);
    const age = today.getFullYear() - birthdate.getFullYear() + 1;
    
    if (daysUntil === 0) {
        return `🎂 HEUTE hat ${person.name} Geburtstag!\n` +
               `${person.name} wird ${age} Jahre alt.\n` +
               `📱 Tel: ${person.phone || 'Keine Nummer'}\n` +
               `Vergiss nicht zu gratulieren! 🎉`;
    } else {
        return `📅 Erinnerung: ${person.name} hat in ${daysUntil} Tagen Geburtstag!\n` +
               `Datum: ${birthdate.toLocaleDateString('de-DE')}\n` +
               `Wird ${age} Jahre alt.\n` +
               `📱 Tel: ${person.phone || 'Keine Nummer'}`;
    }
}

// API: Sende WhatsApp Nachricht
app.post('/api/whatsapp/send', (req, res) => {
    const { to, message, personId } = req.body;
    
    console.log('📱 WhatsApp Nachricht:');
    console.log(`   An: ${to}`);
    console.log(`   Nachricht: ${message}`);
    
    // Hier würde die echte WhatsApp Business API verwendet
    // Für Demo: Öffne WhatsApp Web mit vor-ausgefüllter Nachricht
    const whatsappUrl = `https://wa.me/${to.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    
    // Log in Datenbank
    db.run(
        'INSERT INTO notification_log (person_id, type, recipient, message, sent_at) VALUES (?, ?, ?, ?, ?)',
        [personId, 'whatsapp', to, message, new Date().toISOString()],
        (err) => {
            if (err) console.error('Log-Fehler:', err);
        }
    );
    
    res.json({
        success: true,
        url: whatsappUrl,
        message: 'WhatsApp Web Link generiert'
    });
});

// API: Bulk WhatsApp für heute
app.get('/api/whatsapp/today', (req, res) => {
    const today = new Date();
    const todayStr = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    db.all(
        `SELECT * FROM people WHERE strftime('%m-%d', birthdate) = ?`,
        [todayStr],
        (err, people) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            const messages = people.map(person => ({
                person: person.name,
                phone: person.phone,
                message: formatWhatsAppMessage(person, 0),
                whatsappUrl: person.phone ? 
                    `https://wa.me/${person.phone.replace(/\D/g, '')}?text=${encodeURIComponent(formatWhatsAppMessage(person, 0))}` 
                    : null
            }));
            
            console.log(`📱 ${messages.length} Geburtstage heute`);
            res.json(messages);
        }
    );
});

// === EMAIL INTEGRATION ===
// Simuliert Email-Versand - In Production würde man SMTP/SendGrid verwenden

function formatEmailContent(person, daysUntil) {
    const birthdate = new Date(person.birthdate);
    const age = new Date().getFullYear() - birthdate.getFullYear() + (daysUntil === 0 ? 0 : 1);
    
    if (daysUntil === 0) {
        return {
            subject: `🎂 Heute: ${person.name} hat Geburtstag!`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                    <h1>🎂 Geburtstagsreminder</h1>
                    <h2>Heute hat ${person.name} Geburtstag!</h2>
                    <p><strong>Wird ${age} Jahre alt</strong></p>
                    <p>📱 Telefon: ${person.phone || 'Nicht angegeben'}</p>
                    <p>✉️ Email: ${person.email || 'Nicht angegeben'}</p>
                    <p>📝 Notizen: ${person.notes || 'Keine'}</p>
                    <hr>
                    <p>Vergiss nicht zu gratulieren! 🎉</p>
                </div>
            `
        };
    } else {
        return {
            subject: `📅 Erinnerung: ${person.name} in ${daysUntil} Tagen`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>📅 Geburtstags-Vorwarnung</h2>
                    <p>${person.name} hat in ${daysUntil} Tagen Geburtstag.</p>
                    <p>Datum: ${birthdate.toLocaleDateString('de-DE')}</p>
                    <p>Wird ${age} Jahre alt.</p>
                    <p>Kontakt: ${person.phone || person.email || 'Keine Kontaktdaten'}</p>
                </div>
            `
        };
    }
}

// API: Sende Email
app.post('/api/email/send', (req, res) => {
    const { to, subject, html, personId } = req.body;
    
    console.log('✉️ Email:');
    console.log(`   An: ${to}`);
    console.log(`   Betreff: ${subject}`);
    
    // Hier würde ein echter Email-Service verwendet (SendGrid, SMTP, etc.)
    // Für Demo: Generiere mailto Link
    const mailtoUrl = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(html.replace(/<[^>]*>/g, ''))}`;
    
    // Log in Datenbank
    db.run(
        'INSERT INTO notification_log (person_id, type, recipient, message, sent_at) VALUES (?, ?, ?, ?, ?)',
        [personId, 'email', to, subject, new Date().toISOString()],
        (err) => {
            if (err) console.error('Log-Fehler:', err);
        }
    );
    
    res.json({
        success: true,
        url: mailtoUrl,
        message: 'Email vorbereitet'
    });
});

// API: Email-Report für alle kommenden Geburtstage
app.post('/api/email/weekly-report', (req, res) => {
    const { recipientEmail } = req.body;
    
    // Hole Geburtstage der nächsten 7 Tage
    const dates = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        dates.push(`${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`);
    }
    
    db.all(
        `SELECT * FROM people WHERE strftime('%m-%d', birthdate) IN (${dates.map(() => '?').join(',')})`,
        dates,
        (err, people) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            const html = `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h1>📅 Geburtstage diese Woche</h1>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: #667eea; color: white;">
                                <th style="padding: 10px;">Name</th>
                                <th style="padding: 10px;">Datum</th>
                                <th style="padding: 10px;">Alter</th>
                                <th style="padding: 10px;">Kontakt</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${people.map(p => {
                                const bd = new Date(p.birthdate);
                                const age = new Date().getFullYear() - bd.getFullYear();
                                return `
                                    <tr style="border-bottom: 1px solid #ddd;">
                                        <td style="padding: 10px;">${p.name}</td>
                                        <td style="padding: 10px;">${bd.toLocaleDateString('de-DE')}</td>
                                        <td style="padding: 10px;">${age + 1}</td>
                                        <td style="padding: 10px;">${p.phone || p.email || '-'}</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                    <p>Insgesamt ${people.length} Geburtstage diese Woche!</p>
                </div>
            `;
            
            console.log(`✉️ Wochenreport: ${people.length} Geburtstage`);
            res.json({
                success: true,
                count: people.length,
                html: html,
                subject: `📅 ${people.length} Geburtstage diese Woche`
            });
        }
    );
});

// === AUTOMATISCHE BENACHRICHTIGUNGEN ===

// Prüfe täglich um 9 Uhr morgens
function checkDailyBirthdays() {
    const today = new Date();
    const todayStr = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    console.log(`\n🔔 Prüfe Geburtstage für ${todayStr}...`);
    
    db.all(
        `SELECT * FROM people WHERE strftime('%m-%d', birthdate) = ?`,
        [todayStr],
        (err, people) => {
            if (err) {
                console.error('Fehler:', err);
                return;
            }
            
            console.log(`   ${people.length} Geburtstage heute!`);
            people.forEach(person => {
                console.log(`   🎂 ${person.name}`);
                // Hier würden automatische Nachrichten verschickt
            });
        }
    );
}

// === NOTIFICATION LOG TABLE ===
db.run(`CREATE TABLE IF NOT EXISTS notification_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    person_id INTEGER,
    type TEXT,
    recipient TEXT,
    message TEXT,
    sent_at TEXT
)`, (err) => {
    if (!err) console.log('✅ Notification Log Tabelle bereit');
});

// Starte Server
app.listen(PORT, () => {
    console.log(`✅ Communication Server läuft auf Port ${PORT}`);
    console.log(`   http://localhost:${PORT}`);
    console.log('');
    console.log('📱 WhatsApp Endpoints:');
    console.log('   POST /api/whatsapp/send');
    console.log('   GET  /api/whatsapp/today');
    console.log('');
    console.log('✉️ Email Endpoints:');
    console.log('   POST /api/email/send');
    console.log('   POST /api/email/weekly-report');
    
    // Prüfe initial
    checkDailyBirthdays();
    
    // Prüfe alle 60 Minuten
    setInterval(checkDailyBirthdays, 60 * 60 * 1000);
});

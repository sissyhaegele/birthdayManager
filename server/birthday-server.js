const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Serve BirthdayManager.html als Hauptseite
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'BirthdayManager.html'));
});

// Datenbank initialisieren
const db = new sqlite3.Database('./birthday_manager.db', (err) => {
    if (err) {
        console.error('Datenbankfehler:', err);
    } else {
        console.log('✅ Datenbank verbunden/erstellt');
        
        // Erstelle Tabelle falls nicht vorhanden
        db.run(`CREATE TABLE IF NOT EXISTS people (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            birthdate TEXT NOT NULL,
            groups TEXT,
            phone TEXT,
            email TEXT,
            notes TEXT
        )`, (err) => {
            if (err) {
                console.error('Fehler beim Erstellen der Tabelle:', err);
            } else {
                console.log('✅ Tabelle "people" bereit');
            }
        });
        
        // Erstelle groups Tabelle
        db.run(`CREATE TABLE IF NOT EXISTS groups (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE
        )`, (err) => {
            if (err) {
                console.error('Fehler beim Erstellen der groups Tabelle:', err);
            } else {
                console.log('✅ Tabelle "groups" bereit');
                
                // Füge Standard-Gruppen hinzu
                const defaultGroups = ['Familie', 'Freunde', 'Arbeit', 'Verein'];
                defaultGroups.forEach(group => {
                    db.run('INSERT OR IGNORE INTO groups (name) VALUES (?)', [group]);
                });
            }
        });
    }
});

// API: Alle Personen abrufen
app.get('/api/people', (req, res) => {
    db.all('SELECT * FROM people ORDER BY name', (err, rows) => {
        if (err) {
            console.error('Fehler beim Abrufen:', err);
            res.status(500).json({ error: err.message });
            return;
        }
        
        // Parse groups JSON string
        const people = (rows || []).map(row => {
            try {
                return {
                    ...row,
                    groups: row.groups ? JSON.parse(row.groups) : []
                };
            } catch (e) {
                return {
                    ...row,
                    groups: []
                };
            }
        });
        
        console.log(`📊 ${people.length} Personen geladen`);
        res.json(people);
    });
});

// API: Person hinzufügen
app.post('/api/people', (req, res) => {
    const { name, birthdate, groups, phone, email, notes } = req.body;
    const groupsStr = JSON.stringify(groups || []);
    
    console.log('➕ Füge Person hinzu:', name);
    
    db.run(
        'INSERT INTO people (name, birthdate, groups, phone, email, notes) VALUES (?, ?, ?, ?, ?, ?)',
        [name, birthdate, groupsStr, phone || '', email || '', notes || ''],
        function(err) {
            if (err) {
                console.error('Fehler beim Hinzufügen:', err);
                res.status(500).json({ error: err.message });
                return;
            }
            console.log('✅ Person hinzugefügt mit ID:', this.lastID);
            res.json({ 
                id: this.lastID,
                name,
                birthdate,
                groups: groups || [],
                phone: phone || '',
                email: email || '',
                notes: notes || ''
            });
        }
    );
});

// API: Person aktualisieren
app.put('/api/people/:id', (req, res) => {
    const { name, birthdate, groups, phone, email, notes } = req.body;
    const groupsStr = JSON.stringify(groups || []);
    
    console.log('✏️ Aktualisiere Person ID:', req.params.id);
    
    db.run(
        'UPDATE people SET name=?, birthdate=?, groups=?, phone=?, email=?, notes=? WHERE id=?',
        [name, birthdate, groupsStr, phone || '', email || '', notes || '', req.params.id],
        function(err) {
            if (err) {
                console.error('Fehler beim Update:', err);
                res.status(500).json({ error: err.message });
                return;
            }
            console.log('✅ Person aktualisiert');
            res.json({ 
                id: req.params.id,
                name,
                birthdate,
                groups: groups || [],
                phone: phone || '',
                email: email || '',
                notes: notes || ''
            });
        }
    );
});

// API: Person löschen
app.delete('/api/people/:id', (req, res) => {
    console.log('🗑️ Lösche Person ID:', req.params.id);
    
    db.run('DELETE FROM people WHERE id=?', req.params.id, function(err) {
        if (err) {
            console.error('Fehler beim Löschen:', err);
            res.status(500).json({ error: err.message });
            return;
        }
        console.log('✅ Person gelöscht');
        res.json({ deleted: req.params.id, success: true });
    });
});

// API: Gruppen abrufen
app.get('/api/groups', (req, res) => {
    db.all('SELECT * FROM groups ORDER BY name', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows || []);
    });
});

// Server starten
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║           🎂 BIRTHDAY MANAGER SERVER                       ║
╠════════════════════════════════════════════════════════════╣
║                                                             ║
║  ✅ Server läuft auf: http://localhost:${PORT}            ║
║                                                             ║
║  API Endpoints:                                            ║
║  • GET    /api/people      - Alle Personen                ║
║  • POST   /api/people      - Person hinzufügen            ║
║  • PUT    /api/people/:id  - Person bearbeiten            ║
║  • DELETE /api/people/:id  - Person löschen               ║
║  • GET    /api/groups      - Alle Gruppen                 ║
║                                                             ║
╚════════════════════════════════════════════════════════════╝
    `);
    
    // Browser öffnen
    const { exec } = require('child_process');
    setTimeout(() => {
        exec(`start http://localhost:${PORT}`);
    }, 1000);
});

// Graceful Shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Server wird beendet...');
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Datenbank geschlossen.');
        process.exit(0);
    });
});

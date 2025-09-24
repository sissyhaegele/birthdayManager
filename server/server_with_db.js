// server_with_db.js - Birthday Manager mit SQLite Datenbank
// Installation: npm install express sqlite3 cors body-parser

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.'));

// Datenbank initialisieren
const dbPath = path.join(__dirname, 'birthday_manager.db');
const db = new sqlite3.Database(dbPath);

// Datenbank-Schema erstellen
db.serialize(() => {
    // Bereiche Tabelle
    db.run(`CREATE TABLE IF NOT EXISTS groups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        color TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    // Personen Tabelle
    db.run(`CREATE TABLE IF NOT EXISTS people (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        birthdate DATE NOT NULL,
        email TEXT,
        phone TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    // Personen-Bereiche Zuordnung (Many-to-Many)
    db.run(`CREATE TABLE IF NOT EXISTS person_groups (
        person_id INTEGER,
        group_id INTEGER,
        PRIMARY KEY (person_id, group_id),
        FOREIGN KEY (person_id) REFERENCES people (id) ON DELETE CASCADE,
        FOREIGN KEY (group_id) REFERENCES groups (id) ON DELETE CASCADE
    )`);
    
    // Standard-Bereiche einfügen
    const defaultGroups = ['Familie', 'Verein', 'CDU', 'Freunde', 'Arbeit', 'Nachbarn'];
    const stmt = db.prepare("INSERT OR IGNORE INTO groups (name) VALUES (?)");
    defaultGroups.forEach(group => {
        stmt.run(group);
    });
    stmt.finalize();
    
    console.log('✓ Datenbank initialisiert: birthday_manager.db');
});

// API Endpoints

// GET - Alle Bereiche abrufen
app.get('/api/groups', (req, res) => {
    db.all("SELECT * FROM groups ORDER BY name", (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// POST - Neuer Bereich
app.post('/api/groups', (req, res) => {
    const { name, color } = req.body;
    db.run("INSERT INTO groups (name, color) VALUES (?, ?)", 
        [name, color || null], 
        function(err) {
            if (err) {
                res.status(400).json({ error: err.message });
                return;
            }
            res.json({ id: this.lastID, name, color });
        }
    );
});

// DELETE - Bereich löschen
app.delete('/api/groups/:id', (req, res) => {
    const { id } = req.params;
    db.run("DELETE FROM groups WHERE id = ?", id, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ deleted: this.changes });
    });
});

// GET - Alle Personen abrufen (mit Bereichen)
app.get('/api/people', (req, res) => {
    const query = `
        SELECT 
            p.*,
            GROUP_CONCAT(g.name) as groups_list,
            GROUP_CONCAT(g.id) as group_ids
        FROM people p
        LEFT JOIN person_groups pg ON p.id = pg.person_id
        LEFT JOIN groups g ON pg.group_id = g.id
        GROUP BY p.id
        ORDER BY strftime('%m', p.birthdate), strftime('%d', p.birthdate)
    `;
    
    db.all(query, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        // Gruppen-Arrays erstellen
        const people = rows.map(row => ({
            ...row,
            groups: row.groups_list ? row.groups_list.split(',') : [],
            group_ids: row.group_ids ? row.group_ids.split(',').map(Number) : []
        }));
        
        res.json(people);
    });
});

// GET - Personen nach Bereich
app.get('/api/people/group/:groupId', (req, res) => {
    const { groupId } = req.params;
    const query = `
        SELECT p.*, GROUP_CONCAT(g.name) as groups_list
        FROM people p
        JOIN person_groups pg ON p.id = pg.person_id
        JOIN groups g ON pg.group_id = g.id
        WHERE p.id IN (
            SELECT person_id FROM person_groups WHERE group_id = ?
        )
        GROUP BY p.id
    `;
    
    db.all(query, [groupId], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// POST - Neue Person
app.post('/api/people', (req, res) => {
    const { name, birthdate, email, phone, notes, group_ids } = req.body;
    
    db.run(
        "INSERT INTO people (name, birthdate, email, phone, notes) VALUES (?, ?, ?, ?, ?)",
        [name, birthdate, email || null, phone || null, notes || null],
        function(err) {
            if (err) {
                res.status(400).json({ error: err.message });
                return;
            }
            
            const personId = this.lastID;
            
            // Bereiche zuordnen
            if (group_ids && group_ids.length > 0) {
                const stmt = db.prepare("INSERT INTO person_groups (person_id, group_id) VALUES (?, ?)");
                group_ids.forEach(groupId => {
                    stmt.run(personId, groupId);
                });
                stmt.finalize();
            }
            
            res.json({ id: personId, name, birthdate, email, phone, notes, group_ids });
        }
    );
});

// PUT - Person aktualisieren
app.put('/api/people/:id', (req, res) => {
    const { id } = req.params;
    const { name, birthdate, email, phone, notes, group_ids } = req.body;
    
    db.run(
        `UPDATE people 
         SET name = ?, birthdate = ?, email = ?, phone = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [name, birthdate, email || null, phone || null, notes || null, id],
        function(err) {
            if (err) {
                res.status(400).json({ error: err.message });
                return;
            }
            
            // Bereiche neu zuordnen
            db.run("DELETE FROM person_groups WHERE person_id = ?", id, () => {
                if (group_ids && group_ids.length > 0) {
                    const stmt = db.prepare("INSERT INTO person_groups (person_id, group_id) VALUES (?, ?)");
                    group_ids.forEach(groupId => {
                        stmt.run(id, groupId);
                    });
                    stmt.finalize();
                }
                res.json({ updated: this.changes });
            });
        }
    );
});

// DELETE - Person löschen
app.delete('/api/people/:id', (req, res) => {
    const { id } = req.params;
    db.run("DELETE FROM people WHERE id = ?", id, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ deleted: this.changes });
    });
});

// GET - Kommende Geburtstage
app.get('/api/birthdays/upcoming', (req, res) => {
    const days = req.query.days || 30;
    const query = `
        SELECT 
            p.*,
            GROUP_CONCAT(g.name) as groups_list,
            julianday(
                date(
                    strftime('%Y', 'now') || '-' || 
                    strftime('%m-%d', p.birthdate)
                )
            ) - julianday('now') as days_until,
            CASE 
                WHEN julianday(date(strftime('%Y', 'now') || '-' || strftime('%m-%d', p.birthdate))) < julianday('now')
                THEN julianday(date((strftime('%Y', 'now') + 1) || '-' || strftime('%m-%d', p.birthdate))) - julianday('now')
                ELSE julianday(date(strftime('%Y', 'now') || '-' || strftime('%m-%d', p.birthdate))) - julianday('now')
            END as days_until_next
        FROM people p
        LEFT JOIN person_groups pg ON p.id = pg.person_id
        LEFT JOIN groups g ON pg.group_id = g.id
        GROUP BY p.id
        HAVING days_until_next BETWEEN 0 AND ?
        ORDER BY days_until_next
    `;
    
    db.all(query, [days], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// GET - Statistiken
app.get('/api/statistics', (req, res) => {
    const stats = {};
    
    // Gesamtanzahl Personen
    db.get("SELECT COUNT(*) as total FROM people", (err, row) => {
        stats.totalPeople = row.total;
        
        // Anzahl Bereiche
        db.get("SELECT COUNT(*) as total FROM groups", (err, row) => {
            stats.totalGroups = row.total;
            
            // Geburtstage diesen Monat
            db.get(`
                SELECT COUNT(*) as total 
                FROM people 
                WHERE strftime('%m', birthdate) = strftime('%m', 'now')
            `, (err, row) => {
                stats.birthdaysThisMonth = row.total;
                
                // Personen mit mehreren Bereichen
                db.get(`
                    SELECT COUNT(DISTINCT person_id) as total 
                    FROM (
                        SELECT person_id, COUNT(group_id) as group_count 
                        FROM person_groups 
                        GROUP BY person_id 
                        HAVING group_count > 1
                    )
                `, (err, row) => {
                    stats.multiGroupPeople = row.total;
                    res.json(stats);
                });
            });
        });
    });
});

// CSV Export
app.get('/api/export/csv', (req, res) => {
    const query = `
        SELECT 
            p.name,
            p.birthdate,
            GROUP_CONCAT(g.name, ';') as groups,
            p.email,
            p.phone,
            p.notes
        FROM people p
        LEFT JOIN person_groups pg ON p.id = pg.person_id
        LEFT JOIN groups g ON pg.group_id = g.id
        GROUP BY p.id
    `;
    
    db.all(query, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        const BOM = '\uFEFF';
        let csv = BOM + 'Name,Geburtsdatum,Bereiche,Email,Telefon,Notizen\n';
        
        rows.forEach(row => {
            const date = new Date(row.birthdate);
            const dateStr = `${date.getDate().toString().padStart(2,'0')}.${(date.getMonth()+1).toString().padStart(2,'0')}.${date.getFullYear()}`;
            csv += `"${row.name}","${dateStr}","${row.groups || ''}","${row.email || ''}","${row.phone || ''}","${row.notes || ''}"\n`;
        });
        
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="birthday_export.csv"');
        res.send(csv);
    });
});

// Server starten
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════╗
║   Birthday Manager Server mit Datenbank       ║
╠════════════════════════════════════════════════╣
║   Server läuft auf: http://localhost:${PORT}    ║
║   Datenbank: birthday_manager.db              ║
║                                                ║
║   API Endpoints:                               ║
║   GET  /api/people     - Alle Personen        ║
║   POST /api/people     - Person hinzufügen    ║
║   GET  /api/groups     - Alle Bereiche        ║
║   GET  /api/statistics - Statistiken          ║
╚════════════════════════════════════════════════╝
    `);
});

// Graceful Shutdown
process.on('SIGINT', () => {
    console.log('\n✓ Server wird beendet...');
    db.close(() => {
        console.log('✓ Datenbank geschlossen');
        process.exit(0);
    });
});

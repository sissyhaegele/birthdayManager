const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./birthday_manager.db');

console.log('📊 DATENBANK STATUS:\n');

db.get('SELECT COUNT(*) as count FROM people', (err, row) => {
    if (!err) {
        console.log(`✅ Personen gesamt: ${row.count}`);
    }
    
    // Geburtstage heute
    const today = new Date();
    const todayStr = `${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
    
    db.all(`SELECT * FROM people WHERE strftime('%m-%d', birthdate) = ?`, [todayStr], (err, rows) => {
        if (!err) {
            console.log(`🎂 Geburtstage heute: ${rows.length}`);
            rows.forEach(p => console.log(`   - ${p.name}`));
        }
        
        // Nächste 7 Tage
        console.log('\n📅 Kommende Geburtstage (7 Tage):');
        const dates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            dates.push(`${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`);
        }
        
        db.all(
            `SELECT name, birthdate FROM people WHERE strftime('%m-%d', birthdate) IN (${dates.map(() => '?').join(',')}) ORDER BY strftime('%m-%d', birthdate)`,
            dates,
            (err, upcoming) => {
                if (!err && upcoming.length > 0) {
                    upcoming.forEach(p => {
                        const bd = new Date(p.birthdate);
                        console.log(`   - ${p.name}: ${bd.getDate()}.${bd.getMonth()+1}.`);
                    });
                } else {
                    console.log('   Keine in den nächsten 7 Tagen');
                }
                db.close();
            }
        );
    });
});

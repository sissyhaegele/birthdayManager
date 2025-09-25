// Auto-Backup Utility für tägliche Sicherung
const AUTO_BACKUP_KEY = 'birthday_manager_auto_backup';
const LAST_BACKUP_KEY = 'birthday_manager_last_backup';
const BACKUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 Stunden

export const initAutoBackup = () => {
  // Prüfe beim Start ob Backup nötig ist
  checkAndPerformBackup();
  
  // Setze Interval für regelmäßige Prüfung (alle Stunde prüfen)
  setInterval(() => {
    checkAndPerformBackup();
  }, 60 * 60 * 1000); // Jede Stunde prüfen
};

export const checkAndPerformBackup = async () => {
  const lastBackup = localStorage.getItem(LAST_BACKUP_KEY);
  const now = new Date();
  
  // Prüfe ob 24 Stunden vergangen sind
  if (!lastBackup || (now - new Date(lastBackup)) > BACKUP_INTERVAL) {
    await performAutoBackup();
  }
};

export const performAutoBackup = async () => {
  try {
    // Hole alle Kontakte aus IndexedDB
    const request = indexedDB.open('BirthdayManagerDB', 1);
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['contacts'], 'readonly');
      const store = transaction.objectStore('contacts');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => {
        const contacts = getAllRequest.result;
        const now = new Date();
        
        // Erstelle Backup-Objekt
        const backup = {
          timestamp: now.toISOString(),
          date: now.toLocaleDateString('de-DE'),
          time: now.toLocaleTimeString('de-DE'),
          version: '1.0.0',
          count: contacts.length,
          contacts: contacts
        };
        
        // Speichere in LocalStorage
        localStorage.setItem(AUTO_BACKUP_KEY, JSON.stringify(backup));
        localStorage.setItem(LAST_BACKUP_KEY, now.toISOString());
        
        console.log(`✅ Auto-Backup erfolgreich: ${contacts.length} Kontakte gesichert (${now.toLocaleString('de-DE')})`);
        
        // Optional: Zeige Benachrichtigung
        showBackupNotification(contacts.length);
      };
    };
  } catch (error) {
    console.error('❌ Auto-Backup fehlgeschlagen:', error);
  }
};

// Backup wiederherstellen
export const restoreFromAutoBackup = () => {
  const backupData = localStorage.getItem(AUTO_BACKUP_KEY);
  
  if (!backupData) {
    alert('Kein Auto-Backup vorhanden');
    return null;
  }
  
  try {
    const backup = JSON.parse(backupData);
    alert(`Backup vom ${backup.date} ${backup.time} mit ${backup.count} Kontakten gefunden`);
    return backup.contacts;
  } catch (error) {
    console.error('Fehler beim Laden des Backups:', error);
    return null;
  }
};

// Backup als Datei herunterladen
export const downloadAutoBackup = () => {
  const backupData = localStorage.getItem(AUTO_BACKUP_KEY);
  
  if (!backupData) {
    alert('Kein Auto-Backup vorhanden');
    return;
  }
  
  const backup = JSON.parse(backupData);
  const dataStr = JSON.stringify(backup, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `birthday-auto-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  
  console.log('📥 Auto-Backup heruntergeladen');
};

// Zeige dezente Benachrichtigung
const showBackupNotification = (count) => {
  // Erstelle ein kleines Notification-Element
  const notification = document.createElement('div');
  notification.innerHTML = `
    <div style="
      position: fixed;
      bottom: 20px;
      right: 20px;
      background-color: #10b981;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 10px;
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
    ">
      ✅ Auto-Backup: ${count} Kontakte gesichert
    </div>
  `;
  
  // CSS Animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(400px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(notification);
  
  // Entferne nach 5 Sekunden
  setTimeout(() => {
    notification.remove();
  }, 5000);
};

// Backup-Status anzeigen
export const getBackupStatus = () => {
  const lastBackup = localStorage.getItem(LAST_BACKUP_KEY);
  const backupData = localStorage.getItem(AUTO_BACKUP_KEY);
  
  if (!lastBackup || !backupData) {
    return {
      hasBackup: false,
      message: 'Noch kein Auto-Backup vorhanden'
    };
  }
  
  const backup = JSON.parse(backupData);
  const lastBackupDate = new Date(lastBackup);
  const now = new Date();
  const hoursSinceBackup = Math.round((now - lastBackupDate) / (1000 * 60 * 60));
  
  return {
    hasBackup: true,
    lastBackupDate: lastBackupDate,
    lastBackupFormatted: lastBackupDate.toLocaleString('de-DE'),
    hoursSinceBackup: hoursSinceBackup,
    contactCount: backup.count,
    nextBackupIn: Math.max(0, 24 - hoursSinceBackup),
    message: `Letztes Backup: ${lastBackupDate.toLocaleString('de-DE')} (${backup.count} Kontakte)`
  };
};

export default {
  initAutoBackup,
  checkAndPerformBackup,
  performAutoBackup,
  restoreFromAutoBackup,
  downloadAutoBackup,
  getBackupStatus
};

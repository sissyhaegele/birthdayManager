// Database utility functions with auto-backup
const DB_NAME = 'BirthdayManagerDB';
const DB_VERSION = 1;
const BACKUP_KEY = 'birthday_manager_backup';
const AUTO_SAVE_INTERVAL = 30000; // Auto-save alle 30 Sekunden

// Auto-Export zu LocalStorage als Backup
const autoExportToLocalStorage = (data) => {
  try {
    const backup = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      contacts: data,
      count: data.length
    };
    localStorage.setItem(BACKUP_KEY, JSON.stringify(backup));
    console.log(`✅ Auto-Backup: ${data.length} Kontakte gesichert`);
    return true;
  } catch (error) {
    console.error('Backup fehlgeschlagen:', error);
    return false;
  }
};

// Auto-Export als Download (wöchentlich)
const autoExportToFile = (contacts) => {
  const lastExport = localStorage.getItem('last_file_export');
  const now = new Date();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  
  if (!lastExport || (now - new Date(lastExport)) > oneWeek) {
    const dataStr = JSON.stringify({
      version: '1.0.0',
      exportDate: now.toISOString(),
      contacts: contacts
    }, null, 2);
    
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `birthday-backup-${now.toISOString().split('T')[0]}.json`;
    
    // Zeige Hinweis statt automatischem Download
    const userConfirm = confirm(
      `🔄 Wöchentliches Backup fällig!\n\n` +
      `${contacts.length} Kontakte sichern?\n\n` +
      `Letztes Backup: ${lastExport ? new Date(lastExport).toLocaleDateString('de-DE') : 'Nie'}`
    );
    
    if (userConfirm) {
      a.click();
      localStorage.setItem('last_file_export', now.toISOString());
      return true;
    }
  }
  return false;
};

// Import von LocalStorage Backup
const importFromLocalStorage = () => {
  try {
    const backup = localStorage.getItem(BACKUP_KEY);
    if (backup) {
      const data = JSON.parse(backup);
      console.log(`📥 Backup gefunden: ${data.count} Kontakte vom ${new Date(data.timestamp).toLocaleString('de-DE')}`);
      return data.contacts;
    }
  } catch (error) {
    console.error('Backup-Import fehlgeschlagen:', error);
  }
  return null;
};

// Original IndexedDB Funktionen
export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => {
      reject(new Error('IndexedDB konnte nicht geöffnet werden'));
    };
    
    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('contacts')) {
        const contactStore = db.createObjectStore('contacts', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        contactStore.createIndex('nachname', 'nachname', { unique: false });
        contactStore.createIndex('geburtstag', 'geburtstag', { unique: false });
        contactStore.createIndex('gruppen', 'gruppen', { unique: false, multiEntry: true });
      }
      
      if (!db.objectStoreNames.contains('groups')) {
        const groupStore = db.createObjectStore('groups', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        groupStore.createIndex('name', 'name', { unique: true });
      }
    };
  });
};

export const getDB = async () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = () => reject(new Error('Datenbankzugriff fehlgeschlagen'));
  });
};

// Erweiterte getAllContacts mit Auto-Backup
export const getAllContacts = async () => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['contacts'], 'readonly');
    const store = transaction.objectStore('contacts');
    const request = store.getAll();
    
    request.onsuccess = () => {
      const contacts = request.result;
      
      // Auto-Backup zu LocalStorage
      autoExportToLocalStorage(contacts);
      
      // Wöchentliches File-Backup prüfen
      autoExportToFile(contacts);
      
      resolve(contacts);
    };
    request.onerror = () => reject(new Error('Kontakte konnten nicht geladen werden'));
  });
};

// Kontakt speichern mit Auto-Backup
export const saveContact = async (contact) => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['contacts'], 'readwrite');
    const store = transaction.objectStore('contacts');
    
    const request = contact.id 
      ? store.put(contact)
      : store.add(contact);
    
    request.onsuccess = async () => {
      // Nach dem Speichern, alle Kontakte für Backup laden
      const allContacts = await getAllContacts();
      autoExportToLocalStorage(allContacts);
      resolve(request.result);
    };
    request.onerror = () => reject(new Error('Kontakt konnte nicht gespeichert werden'));
  });
};

// Wiederherstellung von Backup
export const restoreFromBackup = async () => {
  const backupData = importFromLocalStorage();
  
  if (!backupData || backupData.length === 0) {
    return { success: false, message: 'Kein Backup gefunden' };
  }
  
  const db = await getDB();
  const transaction = db.transaction(['contacts'], 'readwrite');
  const store = transaction.objectStore('contacts');
  
  // Lösche existierende Daten
  await store.clear();
  
  // Importiere Backup-Daten
  let imported = 0;
  for (const contact of backupData) {
    delete contact.id; // Neue IDs generieren
    await store.add(contact);
    imported++;
  }
  
  return { 
    success: true, 
    message: `${imported} Kontakte wiederhergestellt`,
    count: imported 
  };
};

// Manueller Export
export const exportContactsToFile = async () => {
  const contacts = await getAllContacts();
  const now = new Date();
  
  const exportData = {
    version: '1.0.0',
    exportDate: now.toISOString(),
    appName: 'Birthday Manager',
    count: contacts.length,
    contacts: contacts
  };
  
  const dataStr = JSON.stringify(exportData, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `birthday-manager-export-${now.toISOString().split('T')[0]}.json`;
  a.click();
  
  return { success: true, count: contacts.length };
};

// Import von Datei
export const importContactsFromFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result);
        const contacts = data.contacts || data; // Unterstütze beide Formate
        
        const db = await getDB();
        const transaction = db.transaction(['contacts'], 'readwrite');
        const store = transaction.objectStore('contacts');
        
        let imported = 0;
        for (const contact of contacts) {
          delete contact.id;
          await store.add(contact);
          imported++;
        }
        
        resolve({ success: true, count: imported });
      } catch (error) {
        reject(new Error('Import fehlgeschlagen: ' + error.message));
      }
    };
    
    reader.readAsText(file);
  });
};

// Status-Funktion
export const getBackupStatus = () => {
  const backup = localStorage.getItem(BACKUP_KEY);
  const lastExport = localStorage.getItem('last_file_export');
  
  if (!backup) {
    return { hasBackup: false };
  }
  
  try {
    const data = JSON.parse(backup);
    return {
      hasBackup: true,
      lastBackup: new Date(data.timestamp),
      contactCount: data.count,
      lastFileExport: lastExport ? new Date(lastExport) : null
    };
  } catch {
    return { hasBackup: false };
  }
};

// Export alle Funktionen
export default {
  initDB,
  getAllContacts,
  saveContact,
  deleteContact,
  getAllGroups,
  saveGroups,
  bulkImportContacts,
  exportContactsToCSV,
  exportContactsToFile,
  importContactsFromFile,
  restoreFromBackup,
  getBackupStatus
};

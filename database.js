// Database utility functions for IndexedDB
const DB_NAME = 'BirthdayManagerDB';
const DB_VERSION = 1;

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
      
      // Create contacts store
      if (!db.objectStoreNames.contains('contacts')) {
        const contactStore = db.createObjectStore('contacts', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        contactStore.createIndex('nachname', 'nachname', { unique: false });
        contactStore.createIndex('geburtstag', 'geburtstag', { unique: false });
        contactStore.createIndex('gruppen', 'gruppen', { unique: false, multiEntry: true });
      }
      
      // Create groups store
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

// Contacts operations
export const getAllContacts = async () => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['contacts'], 'readonly');
    const store = transaction.objectStore('contacts');
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('Kontakte konnten nicht geladen werden'));
  });
};

export const saveContact = async (contact) => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['contacts'], 'readwrite');
    const store = transaction.objectStore('contacts');
    
    const request = contact.id 
      ? store.put(contact)
      : store.add(contact);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('Kontakt konnte nicht gespeichert werden'));
  });
};

export const deleteContact = async (id) => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['contacts'], 'readwrite');
    const store = transaction.objectStore('contacts');
    const request = store.delete(id);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error('Kontakt konnte nicht gelöscht werden'));
  });
};

// Groups operations
export const getAllGroups = async () => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['groups'], 'readonly');
    const store = transaction.objectStore('groups');
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('Gruppen konnten nicht geladen werden'));
  });
};

export const saveGroups = async (groups) => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['groups'], 'readwrite');
    const store = transaction.objectStore('groups');
    
    // Clear existing groups
    store.clear();
    
    // Add new groups
    groups.forEach(groupName => {
      store.add({ name: groupName });
    });
    
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(new Error('Gruppen konnten nicht gespeichert werden'));
  });
};

// Bulk import for CSV
export const bulkImportContacts = async (contacts) => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['contacts'], 'readwrite');
    const store = transaction.objectStore('contacts');
    
    let addedCount = 0;
    contacts.forEach(contact => {
      const request = store.add(contact);
      request.onsuccess = () => {
        addedCount++;
        if (addedCount === contacts.length) {
          resolve(addedCount);
        }
      };
    });
    
    transaction.onerror = () => reject(new Error('Bulk-Import fehlgeschlagen'));
  });
};

// Export contacts to CSV
export const exportContactsToCSV = async () => {
  const contacts = await getAllContacts();
  
  const headers = 'Vorname;Nachname;Geburtstag;Gruppen;E-Mail;Telefon;Notizen';
  const rows = contacts.map(c => {
    return [
      c.vorname || '',
      c.nachname || '',
      c.geburtstag || '',
      (c.gruppen || []).join(','),
      c.email || '',
      c.telefon || '',
      c.notizen || ''
    ].join(';');
  });
  
  return headers + '\n' + rows.join('\n');
};

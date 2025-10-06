import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Users, Upload, UserPlus, Edit, Trash2, Save, X, Gift, Clock, MapPin } from 'lucide-react';
import ContactCards from './ContactCards';
import { getCityByPLZ } from '../utils/plzData';


const BirthdayManager = () => {
  const [contacts, setContacts] = useState([]);
  const [groups, setGroups] = useState(['Familie', 'Freunde', 'CDU', 'Kollegen', 'Verein']);
  const [showAddContact, setShowAddContact] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [filterGroup, setFilterGroup] = useState('alle');
  const [searchTerm, setSearchTerm] = useState('');
  const [newGroup, setNewGroup] = useState('');
  const [showUpcoming, setShowUpcoming] = useState(false);

  useEffect(() => {
    initDB();
    loadData();
  }, []);

  const initDB = () => {
    const request = indexedDB.open('BirthdayManagerDB', 2);
    
    request.onerror = () => console.error("IndexedDB Fehler");
    request.onsuccess = () => console.log("Datenbank erfolgreich geöffnet");
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('contacts')) {
        const contactStore = db.createObjectStore('contacts', { keyPath: 'id', autoIncrement: true });
        contactStore.createIndex('name', 'name', { unique: false });
      }
      
      if (!db.objectStoreNames.contains('groups')) {
        db.createObjectStore('groups', { keyPath: 'id', autoIncrement: true });
      }
    };
  };

  const loadData = async () => {
    const request = indexedDB.open('BirthdayManagerDB', 2);
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      
      const contactTransaction = db.transaction(['contacts'], 'readonly');
      const contactStore = contactTransaction.objectStore('contacts');
      const getAllContacts = contactStore.getAll();
      
      getAllContacts.onsuccess = () => {
        setContacts(getAllContacts.result);
      };
      
      const groupTransaction = db.transaction(['groups'], 'readonly');
      const groupStore = groupTransaction.objectStore('groups');
      const getAllGroups = groupStore.getAll();
      
      getAllGroups.onsuccess = () => {
        if (getAllGroups.result.length > 0) {
          setGroups(getAllGroups.result.map(g => g.name));
        }
      };
    };
  };

  const saveContact = async (contact) => {
    const request = indexedDB.open('BirthdayManagerDB', 2);
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['contacts'], 'readwrite');
      const store = transaction.objectStore('contacts');
      
      if (contact.id) {
        store.put(contact);
      } else {
        store.add(contact);
      }
      
      transaction.oncomplete = () => loadData();
    };
  };

  const deleteContact = async (id) => {
    const request = indexedDB.open('BirthdayManagerDB', 2);
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['contacts'], 'readwrite');
      const store = transaction.objectStore('contacts');
      store.delete(id);
      
      transaction.oncomplete = () => loadData();
    };
  };

  const saveGroups = async () => {
    const request = indexedDB.open('BirthdayManagerDB', 2);
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['groups'], 'readwrite');
      const store = transaction.objectStore('groups');
      
      store.clear();
      groups.forEach(group => store.add({ name: group }));
    };
  };

  // CSV Import mit Adressfeldern
  const handleCSVUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n');
      
      const newContacts = [];
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '') continue;
        
        const values = lines[i].split(';').map(v => v.trim());
        const contact = {
          vorname: values[0] || '',
          nachname: values[1] || '',
          geburtstag: values[2] || '',
          gruppen: values[3] ? values[3].split(',').map(g => g.trim()) : [],
          email: values[4] || '',
          telefon: values[5] || '',
          strasse: values[6] || '',
          hausnummer: values[7] || '',
          plz: values[8] || '',
          ort: values[9] || '',
          notizen: values[10] || ''
        };
        
        newContacts.push(contact);
      }
      
      newContacts.forEach(contact => saveContact(contact));
      alert(`${newContacts.length} Kontakte wurden importiert!`);
    };
    
    reader.readAsText(file);
  };

  const getDaysUntilBirthday = (birthdate) => {
    if (!birthdate) return null;
    
    const parts = birthdate.trim().split('.');
    if (parts.length !== 3) return null;
    
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const currentYear = today.getFullYear();
    let birthday = new Date(currentYear, month, day);
    birthday.setHours(0, 0, 0, 0);
    
    if (birthday.getTime() === today.getTime()) return 0;
    if (birthday < today) birthday.setFullYear(currentYear + 1);
    
    const diffDays = Math.ceil((birthday - today) / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getAge = (birthdate) => {
    if (!birthdate) return null;
    
    const [day, month, year] = birthdate.split('.');
    const today = new Date();
    let age = today.getFullYear() - year;
    const monthDiff = today.getMonth() + 1 - month;
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < day)) {
      age--;
    }
    
    return age;
  };

  const filteredContacts = useMemo(() => {
    let filtered = contacts;
    
    if (filterGroup !== 'alle') {
      filtered = filtered.filter(c => c.gruppen && c.gruppen.includes(filterGroup));
    }
    
    if (searchTerm) {
      filtered = filtered.filter(c => 
        `${c.vorname} ${c.nachname}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (showUpcoming) {
      filtered = filtered.filter(c => {
        const days = getDaysUntilBirthday(c.geburtstag);
        return days !== null && days <= 30;
      });
    }
    
    return filtered.sort((a, b) => {
      const daysA = getDaysUntilBirthday(a.geburtstag);
      const daysB = getDaysUntilBirthday(b.geburtstag);
      
      if (daysA === null && daysB === null) return 0;
      if (daysA === null) return 1;
      if (daysB === null) return -1;
      
      return daysA - daysB;
    });
  }, [contacts, filterGroup, searchTerm, showUpcoming]);

  // ===== KORRIGIERTES KONTAKT-FORMULAR =====
  const ContactForm = ({ contact, onSave, onCancel }) => {
    // FIX 1: Alle Felder immer definiert (nie undefined)
    const [formData, setFormData] = useState({
      vorname: contact?.vorname || '',
      nachname: contact?.nachname || '',
      geburtstag: contact?.geburtstag || '',
      gruppen: contact?.gruppen || [],
      email: contact?.email || '',
      telefon: contact?.telefon || '',
      strasse: contact?.strasse || '',
      hausnummer: contact?.hausnummer || '',
      plz: contact?.plz || '',
      ort: contact?.ort || '',
      notizen: contact?.notizen || '',
      id: contact?.id
    });

    // FIX 2: PLZ Autocomplete - nur ein setFormData Call
    const handlePLZChange = (value) => {
      if (value.length === 5) {
        const city = getCityByPLZ(value);
        if (city) {
          setFormData(prev => ({ ...prev, plz: value, ort: city }));
        } else {
          setFormData(prev => ({ ...prev, plz: value }));
        }
      } else {
        setFormData(prev => ({ ...prev, plz: value }));
      }
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave(formData);
    };

    const toggleGroup = (group) => {
      const newGroups = formData.gruppen.includes(group)
        ? formData.gruppen.filter(g => g !== group)
        : [...formData.gruppen, group];
      setFormData(prev => ({ ...prev, gruppen: newGroups }));
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">
            {contact ? 'Kontakt bearbeiten' : 'Neuer Kontakt'}
          </h2>
          
          <form onSubmit={handleSubmit}>
            {/* Persönliche Daten */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Vorname *</label>
                <input
                  type="text"
                  value={formData.vorname}
                  onChange={(e) => setFormData(prev => ({ ...prev, vorname: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Nachname *</label>
                <input
                  type="text"
                  value={formData.nachname}
                  onChange={(e) => setFormData(prev => ({ ...prev, nachname: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Geburtstag (TT.MM.JJJJ) *</label>
              <input
                type="text"
                value={formData.geburtstag}
                onChange={(e) => setFormData(prev => ({ ...prev, geburtstag: e.target.value }))}
                placeholder="31.12.1990"
                pattern="\d{1,2}\.\d{1,2}\.\d{4}"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            {/* Adresse */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <MapPin size={18} />
                Adresse
              </h3>
              
              <div className="grid grid-cols-3 gap-4 mb-3">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Straße</label>
                  <input
                    type="text"
                    value={formData.strasse}
                    onChange={(e) => setFormData(prev => ({ ...prev, strasse: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Musterstraße"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Hausnr.</label>
                  <input
                    type="text"
                    value={formData.hausnummer}
                    onChange={(e) => setFormData(prev => ({ ...prev, hausnummer: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="12"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">PLZ</label>
                  <input
                    type="text"
                    value={formData.plz}
                    onChange={(e) => handlePLZChange(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="68789"
                    maxLength="5"
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Ort</label>
                  <input
                    type="text"
                    value={formData.ort}
                    onChange={(e) => setFormData(prev => ({ ...prev, ort: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="St. Leon-Rot"
                  />
                </div>
              </div>
            </div>
            
            {/* Kontaktdaten */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">E-Mail</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Telefon</label>
                <input
                  type="tel"
                  value={formData.telefon}
                  onChange={(e) => setFormData(prev => ({ ...prev, telefon: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            {/* Gruppen */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Gruppen</label>
              <div className="flex flex-wrap gap-2">
                {groups.map(group => (
                  <button
                    key={group}
                    type="button"
                    onClick={() => toggleGroup(group)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      formData.gruppen.includes(group)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {group}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Notizen */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Notizen</label>
              <textarea
                value={formData.notizen}
                onChange={(e) => setFormData(prev => ({ ...prev, notizen: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2"
              >
                <Save size={16} />
                Speichern
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 flex items-center justify-center gap-2"
              >
                <X size={16} />
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Hauptkomponente UI
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Gift className="text-blue-500" size={32} />
              <h1 className="text-3xl font-bold text-gray-800">Birthday Manager</h1>
            </div>
            <div className="flex gap-2">
              <label className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 cursor-pointer flex items-center gap-2">
                <Upload size={20} />
                CSV Import
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCSVUpload}
                  className="hidden"
                />
              </label>
              <button
                onClick={() => setShowAddContact(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
              >
                <UserPlus size={20} />
                Neuer Kontakt
              </button>
            </div>
          </div>
          
          {/* Filter und Suche */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Suche nach Namen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <select
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="alle">Alle Gruppen</option>
              {groups.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
            
            <button
              onClick={() => setShowUpcoming(!showUpcoming)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                showUpcoming
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              <Clock size={20} />
              {showUpcoming ? 'Nächste 30 Tage' : 'Alle anzeigen'}
            </button>
          </div>
        </div>

        {/* Statistik-Karten */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Gesamt Kontakte</p>
                <p className="text-2xl font-bold text-gray-800">{contacts.length}</p>
              </div>
              <Users className="text-blue-500" size={32} />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Diese Woche</p>
                <p className="text-2xl font-bold text-orange-600">
                  {contacts.filter(c => {
                    const days = getDaysUntilBirthday(c.geburtstag);
                    return days !== null && days <= 7;
                  }).length}
                </p>
              </div>
              <Calendar className="text-orange-500" size={32} />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Heute</p>
                <p className="text-2xl font-bold text-green-600">
                  {contacts.filter(c => {
                    const days = getDaysUntilBirthday(c.geburtstag);
                    return days === 0;
                  }).length}
                </p>
              </div>
              <Gift className="text-green-500" size={32} />
            </div>
          </div>
        </div>

        {/* Geburtstags-Kartenansicht */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Geburtstags-Übersicht</h2>
          <ContactCards contacts={filteredContacts} />
        </div>

        {/* Kontaktliste */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 bg-gray-50 border-b">
            <h2 className="text-xl font-semibold text-gray-800">
              {showUpcoming ? 'Anstehende Geburtstage' : 'Alle Kontakte'}
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Geburtstag</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Alter (wird)</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tage bis</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Adresse</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Kontakt</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredContacts.length > 0 ? (
                  filteredContacts.map((contact) => {
                    const days = getDaysUntilBirthday(contact.geburtstag);
                    const age = getAge(contact.geburtstag);
                    
                    return (
                      <tr key={contact.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">
                            {contact.vorname} {contact.nachname}
                          </div>
                          {contact.gruppen && contact.gruppen.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {contact.gruppen.map(group => (
                                <span key={group} className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full">
                                  {group}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {contact.geburtstag}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {age !== null ? `${age + 1} Jahre` : '-'}
                        </td>
                        <td className="px-4 py-3">
                          {days !== null && (
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              days === 0 ? 'bg-green-100 text-green-800' :
                              days <= 7 ? 'bg-orange-100 text-orange-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {days === 0 ? 'Heute!' : `${days} Tage`}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-sm">
                          {(contact.strasse || contact.ort) && (
                            <div>
                              {contact.strasse && contact.hausnummer && (
                                <div>{contact.strasse} {contact.hausnummer}</div>
                              )}
                              {contact.plz && contact.ort && (
                                <div>{contact.plz} {contact.ort}</div>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-sm">
                          {contact.email && <div>{contact.email}</div>}
                          {contact.telefon && <div>{contact.telefon}</div>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => setEditingContact(contact)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Kontakt wirklich löschen?')) {
                                  deleteContact(contact.id);
                                }
                              }}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                      Keine Kontakte gefunden
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Gruppen-Verwaltung */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">Gruppen verwalten</h3>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newGroup}
              onChange={(e) => setNewGroup(e.target.value)}
              placeholder="Neue Gruppe hinzufügen..."
              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => {
                if (newGroup && !groups.includes(newGroup)) {
                  const updatedGroups = [...groups, newGroup];
                  setGroups(updatedGroups);
                  saveGroups();
                  setNewGroup('');
                }
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Hinzufügen
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {groups.map(group => (
              <div key={group} className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-2">
                <span>{group}</span>
                <button
                  onClick={() => {
                    if (confirm(`Gruppe "${group}" wirklich löschen?`)) {
                      const updatedGroups = groups.filter(g => g !== group);
                      setGroups(updatedGroups);
                      saveGroups();
                    }
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* CSV Import Anleitung */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h3 className="font-semibold text-blue-900 mb-2">CSV Import Format:</h3>
          <p className="text-blue-800 text-sm mb-2">
            Die CSV-Datei sollte mit Semikolon (;) getrennt sein und folgende Spalten enthalten:
          </p>
          <code className="block bg-white p-2 rounded text-xs overflow-x-auto">
            Vorname;Nachname;Geburtstag;Gruppen;E-Mail;Telefon;Straße;Hausnummer;PLZ;Ort;Notizen<br/>
            Max;Mustermann;15.03.1985;Familie,Freunde;max@example.com;0171234567;Hauptstr;42;68789;St. Leon-Rot;Mag Schokolade
          </code>
        </div>
      </div>

      {/* Formulare */}
      {showAddContact && (
        <ContactForm
          onSave={(contact) => {
            saveContact(contact);
            setShowAddContact(false);
          }}
          onCancel={() => setShowAddContact(false)}
        />
      )}
      
      {editingContact && (
        <ContactForm
          contact={editingContact}
          onSave={(contact) => {
            saveContact(contact);
            setEditingContact(null);
          }}
          onCancel={() => setEditingContact(null)}
        />
      )}
    </div>
  );
};

export default BirthdayManager;

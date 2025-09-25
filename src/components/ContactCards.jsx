import React from 'react';
import { Edit, Trash2 } from 'lucide-react';

const ContactCards = ({ contacts, onEdit, onDelete }) => {
  const getDaysUntilBirthday = (birthdate) => {
    if (!birthdate) return null;
    
    const [day, month] = birthdate.split('.');
    const today = new Date();
    const thisYear = today.getFullYear();
    
    let birthday = new Date(thisYear, month - 1, day);
    if (birthday < today) {
      birthday = new Date(thisYear + 1, month - 1, day);
    }
    
    const diffDays = Math.ceil((birthday - today) / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const sortedContacts = [...contacts].sort((a, b) => {
    const daysA = getDaysUntilBirthday(a.geburtstag);
    const daysB = getDaysUntilBirthday(b.geburtstag);
    
    if (daysA === null) return 1;
    if (daysB === null) return -1;
    return daysA - daysB;
  });

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {sortedContacts.slice(0, 20).map((contact, index) => (
        <div 
          key={contact.id || index} 
          className="border border-gray-300 rounded p-3 bg-white hover:shadow-lg transition-shadow relative group"
        >
          {/* Bearbeitungs-Buttons - nur bei Hover sichtbar */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            <button
              onClick={() => onEdit(contact)}
              className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              title="Bearbeiten"
            >
              <Edit size={14} />
            </button>
            <button
              onClick={() => {
                if (confirm(`${contact.vorname} ${contact.nachname} wirklich löschen?`)) {
                  onDelete(contact.id);
                }
              }}
              className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
              title="Löschen"
            >
              <Trash2 size={14} />
            </button>
          </div>
          
          {/* Kontakt-Info */}
          <div className="font-semibold">
            {contact.vorname} {contact.nachname}
          </div>
          
          {contact.geburtstag && (
            <div className="text-sm text-gray-600">
              {contact.geburtstag}
            </div>
          )}
          
          {getDaysUntilBirthday(contact.geburtstag) !== null && (
            <div className="text-xs mt-1">
              <span className={`inline-block px-2 py-1 rounded ${
                getDaysUntilBirthday(contact.geburtstag) === 0 ? 'bg-green-500 text-white' :
                getDaysUntilBirthday(contact.geburtstag) <= 7 ? 'bg-orange-500 text-white' :
                'bg-blue-500 text-white'
              }`}>
                {getDaysUntilBirthday(contact.geburtstag) === 0 ? 'HEUTE!' :
                 `In ${getDaysUntilBirthday(contact.geburtstag)} Tagen`}
              </span>
            </div>
          )}
          
          {contact.gruppen && contact.gruppen.length > 0 && (
            <div className="mt-2">
              {contact.gruppen.map((gruppe, idx) => (
                <span key={idx} className="text-xs bg-gray-200 px-1 py-0.5 rounded mr-1">
                  {gruppe}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ContactCards;

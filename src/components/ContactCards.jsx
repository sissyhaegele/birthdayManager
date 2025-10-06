import React from 'react';

const ContactCards = ({ contacts, onEdit, onDelete }) => {
  const getDaysUntilBirthday = (birthdate) => {
    if (!birthdate) return null;

    const parts = birthdate.trim().split('.');
    if (parts.length !== 3) return null;

    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1;

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();

    if (day === currentDay && month === currentMonth) {
      return 0;
    }

    let birthdayThisYear = new Date(currentYear, month, day, 0, 0, 0, 0);
    const todayClean = new Date(currentYear, currentMonth, currentDay, 0, 0, 0, 0);

    if (birthdayThisYear < todayClean) {
      birthdayThisYear = new Date(currentYear + 1, month, day, 0, 0, 0, 0);
    }

    const diffTime = birthdayThisYear.getTime() - todayClean.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
  };

  const getAge = (birthdate) => {
    if (!birthdate) return null;

    const parts = birthdate.trim().split('.');
    if (parts.length !== 3) return null;

    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const year = parseInt(parts[2]);

    const today = new Date();
    let age = today.getFullYear() - year;

    // Hatte die Person dieses Jahr schon Geburtstag?
    const birthdayThisYear = new Date(today.getFullYear(), month - 1, day);
    if (birthdayThisYear > today) {
      age--; // Noch nicht Geburtstag gehabt
    }

    return age;
  };

  const getDisplayAge = (birthdate) => {
    if (!birthdate) return null;

    const parts = birthdate.trim().split('.');
    if (parts.length !== 3) return null;

    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const year = parseInt(parts[2]);

    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth() + 1;

    // Berechne das Alter das die Person WIRD
    let turningAge = today.getFullYear() - year;

    // Wenn der Geburtstag schon war (aber nicht heute), zeige nächstes Jahr
    if (month < currentMonth || (month === currentMonth && day < currentDay)) {
      turningAge = turningAge + 1;
    }

    return turningAge;
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
      {sortedContacts.slice(0, 20).map((contact, index) => {
        const days = getDaysUntilBirthday(contact.geburtstag);
        const nextAge = getDisplayAge(contact.geburtstag);

        return (
          <div
            key={contact.id || index}
            className="border border-gray-300 rounded p-3 bg-white hover:shadow-lg transition-shadow relative group"
          >
            {/* Bearbeitungs-Buttons */}
            {onEdit && onDelete && (
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button
                  onClick={() => onEdit(contact)}
                  className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  title="Bearbeiten"
                >
                  ✏️
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
                  🗑️
                </button>
              </div>
            )}

            {/* Name und Alter Badge */}
            <div className="flex items-start justify-between mb-2 gap-2">
              <div className="font-semibold flex-1 min-w-0">
                {contact.vorname} {contact.nachname}
              </div>
              {nextAge && (
                <span className={`text-white text-xl font-bold px-3 py-1.5 rounded-full shrink-0 min-w-[3rem] text-center ${
                  days === 0 ? 'bg-green-400' :
                  days <= 7 ? 'bg-orange-400' :
                  'bg-blue-400'
                }`}>
                  {nextAge}
                </span>
              )}
            </div>

            {contact.geburtstag && (
              <div className="text-sm text-gray-600">
                {contact.geburtstag}
              </div>
            )}

            {days !== null && (
              <div className="text-xs mt-1">
                <span className={`inline-block px-2 py-1 rounded ${
                  days === 0 ? 'bg-green-500 text-white animate-pulse' :
                  days <= 7 ? 'bg-orange-500 text-white' :
                  'bg-blue-500 text-white'
                }`}>
                  {days === 0 ? '🎉 HEUTE!' : `In ${days} Tagen`}
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
        );
      })}
    </div>
  );
};

export default ContactCards;

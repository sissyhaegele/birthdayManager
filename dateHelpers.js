import { format, parse, differenceInDays, addYears, isValid } from 'date-fns';
import { de } from 'date-fns/locale';

// Parse German date format (DD.MM.YYYY)
export const parseGermanDate = (dateString) => {
  if (!dateString) return null;
  
  try {
    const [day, month, year] = dateString.split('.');
    const date = new Date(year, month - 1, day);
    return isValid(date) ? date : null;
  } catch {
    return null;
  }
};

// Format date to German format
export const formatGermanDate = (date) => {
  if (!date) return '';
  try {
    return format(date, 'dd.MM.yyyy', { locale: de });
  } catch {
    return '';
  }
};

// Calculate days until next birthday
export const getDaysUntilBirthday = (birthdate) => {
  const date = parseGermanDate(birthdate);
  if (!date) return null;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const currentYear = today.getFullYear();
  let nextBirthday = new Date(currentYear, date.getMonth(), date.getDate());
  
  if (nextBirthday < today) {
    nextBirthday = addYears(nextBirthday, 1);
  }
  
  return differenceInDays(nextBirthday, today);
};

// Calculate age
export const getAge = (birthdate) => {
  const date = parseGermanDate(birthdate);
  if (!date) return null;
  
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    age--;
  }
  
  return age;
};

// Get upcoming age (how old they will be on next birthday)
export const getUpcomingAge = (birthdate) => {
  const age = getAge(birthdate);
  if (age === null) return null;
  
  const date = parseGermanDate(birthdate);
  const today = new Date();
  
  // If birthday hasn't happened this year yet
  if (date.getMonth() > today.getMonth() || 
      (date.getMonth() === today.getMonth() && date.getDate() > today.getDate())) {
    return age + 1;
  }
  
  // Birthday already happened or is today
  return age + 1;
};

// Validate German date format
export const isValidGermanDate = (dateString) => {
  if (!dateString) return false;
  
  const regex = /^\d{1,2}\.\d{1,2}\.\d{4}$/;
  if (!regex.test(dateString)) return false;
  
  const date = parseGermanDate(dateString);
  return date !== null && isValid(date);
};

// Get birthday status (today, this week, this month, etc.)
export const getBirthdayStatus = (birthdate) => {
  const days = getDaysUntilBirthday(birthdate);
  if (days === null) return { type: 'unknown', label: 'Kein Datum', color: 'gray' };
  
  if (days === 0) return { type: 'today', label: 'Heute!', color: 'green' };
  if (days === 1) return { type: 'tomorrow', label: 'Morgen', color: 'yellow' };
  if (days <= 7) return { type: 'week', label: `${days} Tage`, color: 'orange' };
  if (days <= 30) return { type: 'month', label: `${days} Tage`, color: 'blue' };
  if (days <= 60) return { type: 'soon', label: `${days} Tage`, color: 'indigo' };
  
  return { type: 'later', label: `${days} Tage`, color: 'gray' };
};

// Sort contacts by upcoming birthdays
export const sortByUpcomingBirthdays = (contacts) => {
  return [...contacts].sort((a, b) => {
    const daysA = getDaysUntilBirthday(a.geburtstag);
    const daysB = getDaysUntilBirthday(b.geburtstag);
    
    if (daysA === null && daysB === null) return 0;
    if (daysA === null) return 1;
    if (daysB === null) return -1;
    
    return daysA - daysB;
  });
};

// Get birthdays in date range
export const getBirthdaysInRange = (contacts, startDays = 0, endDays = 30) => {
  return contacts.filter(contact => {
    const days = getDaysUntilBirthday(contact.geburtstag);
    return days !== null && days >= startDays && days <= endDays;
  });
};

// Group birthdays by month
export const groupBirthdaysByMonth = (contacts) => {
  const months = {};
  
  contacts.forEach(contact => {
    const date = parseGermanDate(contact.geburtstag);
    if (!date) return;
    
    const monthKey = format(date, 'MMMM', { locale: de });
    if (!months[monthKey]) {
      months[monthKey] = [];
    }
    months[monthKey].push(contact);
  });
  
  return months;
};

// CSV parsing and export utilities

export const parseCSV = (csvText, delimiter = ';') => {
  const lines = csvText.split('\n').filter(line => line.trim() !== '');
  if (lines.length < 2) {
    throw new Error('CSV-Datei ist leer oder hat keine Daten');
  }
  
  const headers = lines[0].split(delimiter).map(h => h.trim());
  const expectedHeaders = ['Vorname', 'Nachname', 'Geburtstag', 'Gruppen', 'E-Mail', 'Telefon', 'Notizen'];
  
  // Validate headers (case-insensitive)
  const normalizedHeaders = headers.map(h => h.toLowerCase());
  const missingHeaders = expectedHeaders.filter(
    eh => !normalizedHeaders.includes(eh.toLowerCase())
  );
  
  if (missingHeaders.length > 0) {
    console.warn('Fehlende Spalten:', missingHeaders.join(', '));
  }
  
  const contacts = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = splitCSVLine(line, delimiter);
    
    // Map values to contact object
    const contact = {
      vorname: values[0]?.trim() || '',
      nachname: values[1]?.trim() || '',
      geburtstag: values[2]?.trim() || '',
      gruppen: parseGroups(values[3]),
      email: values[4]?.trim() || '',
      telefon: values[5]?.trim() || '',
      notizen: values[6]?.trim() || ''
    };
    
    // Only add if at least name is present
    if (contact.vorname || contact.nachname) {
      contacts.push(contact);
    }
  }
  
  return contacts;
};

// Handle CSV fields with quotes and special characters
const splitCSVLine = (line, delimiter = ';') => {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
};

// Parse groups from CSV string
const parseGroups = (groupString) => {
  if (!groupString || !groupString.trim()) return [];
  
  return groupString
    .split(',')
    .map(g => g.trim())
    .filter(g => g !== '');
};

// Export contacts to CSV format
export const exportToCSV = (contacts) => {
  const headers = ['Vorname', 'Nachname', 'Geburtstag', 'Gruppen', 'E-Mail', 'Telefon', 'Notizen'];
  const delimiter = ';';
  
  const csvContent = [
    headers.join(delimiter),
    ...contacts.map(contact => {
      const row = [
        escapeCSVField(contact.vorname || ''),
        escapeCSVField(contact.nachname || ''),
        escapeCSVField(contact.geburtstag || ''),
        escapeCSVField((contact.gruppen || []).join(',')),
        escapeCSVField(contact.email || ''),
        escapeCSVField(contact.telefon || ''),
        escapeCSVField(contact.notizen || '')
      ];
      return row.join(delimiter);
    })
  ].join('\n');
  
  return csvContent;
};

// Escape special characters in CSV fields
const escapeCSVField = (field) => {
  if (typeof field !== 'string') {
    field = String(field);
  }
  
  // Check if field needs escaping
  if (field.includes(';') || field.includes('"') || field.includes('\n')) {
    // Escape quotes by doubling them
    field = field.replace(/"/g, '""');
    // Wrap in quotes
    return `"${field}"`;
  }
  
  return field;
};

// Download CSV file
export const downloadCSV = (csvContent, filename = 'contacts.csv') => {
  const BOM = '\uFEFF'; // UTF-8 BOM for Excel compatibility
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (navigator.msSaveBlob) {
    // IE 10+
    navigator.msSaveBlob(blob, filename);
  } else {
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Validate CSV structure before import
export const validateCSV = (csvText) => {
  const errors = [];
  const warnings = [];
  
  try {
    const lines = csvText.split('\n').filter(line => line.trim() !== '');
    
    if (lines.length === 0) {
      errors.push('CSV-Datei ist leer');
      return { valid: false, errors, warnings };
    }
    
    if (lines.length === 1) {
      warnings.push('CSV-Datei enthält nur Header, keine Daten');
    }
    
    // Check delimiter
    const firstLine = lines[0];
    const semicolonCount = (firstLine.match(/;/g) || []).length;
    const commaCount = (firstLine.match(/,/g) || []).length;
    
    if (semicolonCount === 0 && commaCount > 0) {
      errors.push('Falsches Trennzeichen: Bitte Semikolon (;) statt Komma (,) verwenden');
    }
    
    // Check for required columns
    const headers = firstLine.split(';').map(h => h.trim().toLowerCase());
    if (!headers.includes('vorname') && !headers.includes('nachname')) {
      errors.push('Mindestens Vorname oder Nachname muss vorhanden sein');
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
      lineCount: lines.length - 1
    };
  } catch (error) {
    errors.push(`Fehler beim Validieren: ${error.message}`);
    return { valid: false, errors, warnings };
  }
};

// Generate sample CSV for download
export const generateSampleCSV = () => {
  const sampleData = [
    {
      vorname: 'Max',
      nachname: 'Mustermann',
      geburtstag: '15.03.1985',
      gruppen: ['Familie', 'Freunde'],
      email: 'max@example.com',
      telefon: '0171-2345678',
      notizen: 'Mag Bücher'
    },
    {
      vorname: 'Anna',
      nachname: 'Schmidt',
      geburtstag: '22.08.1990',
      gruppen: ['CDU', 'Kollegen'],
      email: 'anna@example.com',
      telefon: '0151-3456789',
      notizen: 'Liebt Schokolade'
    },
    {
      vorname: 'Peter',
      nachname: 'Müller',
      geburtstag: '10.12.1978',
      gruppen: ['Verein', 'Freunde'],
      email: 'peter@example.com',
      telefon: '0160-4567890',
      notizen: 'Fußballfan'
    }
  ];
  
  return exportToCSV(sampleData);
};

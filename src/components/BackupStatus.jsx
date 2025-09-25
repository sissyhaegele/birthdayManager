import React, { useState, useEffect } from 'react';
import { Shield, Download, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { getBackupStatus, exportContactsToFile, restoreFromBackup } from '../utils/database';

const BackupStatus = ({ onImport }) => {
  const [backupStatus, setBackupStatus] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    checkBackupStatus();
    const interval = setInterval(checkBackupStatus, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const checkBackupStatus = () => {
    const status = getBackupStatus();
    setBackupStatus(status);
  };

  const handleExport = async () => {
    try {
      const result = await exportContactsToFile();
      setMessage(`✅ ${result.count} Kontakte exportiert`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(`❌ Export fehlgeschlagen: ${error.message}`);
    }
  };

  const handleRestore = async () => {
    if (confirm('Möchten Sie wirklich das Backup wiederherstellen? Aktuelle Daten werden überschrieben!')) {
      try {
        const result = await restoreFromBackup();
        setMessage(result.message);
        if (result.success && onImport) {
          onImport(); // Reload data
        }
        setTimeout(() => setMessage(''), 5000);
      } catch (error) {
        setMessage(`❌ Wiederherstellung fehlgeschlagen`);
      }
    }
  };

  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      importContactsFromFile(file)
        .then(result => {
          setMessage(`✅ ${result.count} Kontakte importiert`);
          if (onImport) onImport();
        })
        .catch(error => {
          setMessage(`❌ Import fehlgeschlagen: ${error.message}`);
        });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="text-green-500" size={24} />
          <div>
            <h3 className="font-semibold text-gray-800">Backup Status</h3>
            {backupStatus?.hasBackup ? (
              <p className="text-sm text-gray-600">
                Letztes Auto-Backup: {backupStatus.lastBackup.toLocaleString('de-DE')} 
                ({backupStatus.contactCount} Kontakte)
              </p>
            ) : (
              <p className="text-sm text-orange-600">Kein Backup vorhanden</p>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2 text-sm"
            title="Manuelles Backup erstellen"
          >
            <Download size={16} />
            Export
          </button>
          
          <label className="px-3 py-1.5 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-2 text-sm cursor-pointer">
            <Upload size={16} />
            Import
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
          </label>
          
          {backupStatus?.hasBackup && (
            <button
              onClick={handleRestore}
              className="px-3 py-1.5 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm"
              title="Vom Auto-Backup wiederherstellen"
            >
              Wiederherstellen
            </button>
          )}
        </div>
      </div>
      
      {message && (
        <div className={`mt-3 p-2 rounded text-sm ${
          message.includes('✅') ? 'bg-green-100 text-green-800' : 
          message.includes('❌') ? 'bg-red-100 text-red-800' : 
          'bg-blue-100 text-blue-800'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default BackupStatus;

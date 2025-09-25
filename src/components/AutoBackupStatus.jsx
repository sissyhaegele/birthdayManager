import React, { useState, useEffect } from 'react';
import { getBackupStatus, downloadAutoBackup, performAutoBackup } from '../utils/autoBackup';

const AutoBackupStatus = () => {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    // Update Status alle Minute
    const updateStatus = () => {
      setStatus(getBackupStatus());
    };
    
    updateStatus();
    const interval = setInterval(updateStatus, 60000);
    
    return () => clearInterval(interval);
  }, []);

  if (!status) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      backgroundColor: status.hasBackup ? '#f0fdf4' : '#fef2f2',
      border: `1px solid ${status.hasBackup ? '#86efac' : '#fca5a5'}`,
      borderRadius: '8px',
      padding: '10px 15px',
      fontSize: '12px',
      color: status.hasBackup ? '#166534' : '#991b1b',
      zIndex: 1000,
      maxWidth: '300px'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
        💾 Auto-Backup Status
      </div>
      {status.hasBackup ? (
        <>
          <div>✅ {status.message}</div>
          <div style={{ marginTop: '5px', opacity: 0.8 }}>
            Nächstes Backup in {status.nextBackupIn} Stunden
          </div>
          <button
            onClick={downloadAutoBackup}
            style={{
              marginTop: '8px',
              padding: '4px 8px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px'
            }}
          >
            📥 Backup herunterladen
          </button>
        </>
      ) : (
        <div>⏳ Backup wird erstellt...</div>
      )}
    </div>
  );
};

export default AutoBackupStatus;

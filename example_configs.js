// BEISPIEL-KONFIGURATIONEN:

// Familie - Tägliche Info an Familiengruppe
localStorage.setItem('comm_Familie', JSON.stringify({
    wa_mode: 'group',
    wa: true,
    wa_id: 'Familie_WhatsApp',
    individual: false,
    auto_morning: true,
    message_type: 'info_only'
}));

// Verein - Wöchentliche Vorschau
localStorage.setItem('comm_Verein', JSON.stringify({
    wa_mode: 'group',
    wa: true,
    wa_id: 'Vereinsvorstand',
    send_weekly: true,
    message_type: 'preview'
}));

// CDU - Individuelle Benachrichtigungen an Organisatoren
localStorage.setItem('comm_CDU', JSON.stringify({
    wa_mode: 'individual',
    individual: true,
    recipients: ['Vorsitzender', 'Stellvertreter'],
    message_type: 'reminder'
}));

console.log('✅ Beispiel-Konfigurationen gespeichert');

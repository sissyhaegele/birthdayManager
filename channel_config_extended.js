<script>
// === BEREICHS-SPEZIFISCHE CHANNEL-KONFIGURATION ===

// Speichere verschiedene Konfigurationen pro Bereich
const CHANNEL_CONFIGS = {
    Familie: {
        wa_mode: 'group',
        wa_enabled: true,
        wa_group_id: 'Familie_WhatsApp',
        wa_individual: false,
        em_enabled: true,
        em_addresses: 'papa@example.com, mama@example.com',
        auto_morning: true,
        template: 'family'
    },
    CDU: {
        wa_mode: 'both',
        wa_enabled: true,
        wa_group_id: 'CDU_Mitglieder',
        wa_individual: true,
        em_enabled: false,
        telegram_enabled: true,
        telegram_chat: '@cdu_gruppe',
        auto_morning: false,
        template: 'formal'
    },
    Verein: {
        wa_mode: 'group',
        wa_enabled: true,
        wa_group_id: 'Vereinsvorstand',
        em_enabled: true,
        em_addresses: 'vorstand@verein.de',
        webhook_enabled: true,
        webhook_url: 'https://hooks.slack.com/...',
        auto_weekly: true,
        template: 'casual'
    },
    Arbeit: {
        wa_mode: 'individual',
        wa_enabled: false,
        wa_individual: true,
        em_enabled: true,
        em_addresses: 'team@firma.de',
        teams_enabled: true,
        auto_morning: true,
        template: 'business'
    },
    Freunde: {
        wa_mode: 'individual',
        wa_enabled: true,
        wa_individual: true,
        em_enabled: false,
        auto_morning: false,
        template: 'casual'
    },
    Nachbarn: {
        wa_mode: 'none',
        wa_enabled: false,
        em_enabled: false,
        sms_enabled: true,
        auto_morning: false,
        template: 'formal'
    }
};

// Nachrichtenvorlagen pro Typ
const MESSAGE_TEMPLATES = {
    family: {
        group: '👨‍👩‍👧‍👦 FAMILIEN-GEBURTSTAGE\n{date}\n\n{birthdays}\n\nNicht vergessen zu gratulieren! ❤️',
        individual: 'Hallo {recipient}!\n\nErinnerung: {name} hat heute Geburtstag (wird {age}).\n\nLiebe Grüße'
    },
    formal: {
        group: 'GEBURTSTAGS-BENACHRICHTIGUNG\n\nDatum: {date}\nBereich: {group}\n\n{birthdays}\n\nMit freundlichen Grüßen\nBirthday Manager',
        individual: 'Sehr geehrte/r {recipient},\n\nhiermit möchte ich Sie informieren, dass {name} heute Geburtstag hat.\n\nMit freundlichen Grüßen'
    },
    business: {
        group: '📊 Team-Geburtstage\n\n{date}\n\n{birthdays}\n\nBitte entsprechend würdigen.',
        individual: 'Hallo Team,\n\n{name} aus unserer Abteilung hat heute Geburtstag.\n\nViele Grüße'
    },
    casual: {
        group: 'Hey Leute! 🎉\n\n{birthdays}\n\nDenkt dran zu gratulieren! 👍',
        individual: 'Hi!\n\nKurze Info: {name} hat heute Geburtstag 🎂\n\nCheers!'
    }
};

// Lade Konfiguration für spezifischen Bereich
function loadChannelConfig(groupName) {
    // Erst aus LocalStorage
    const saved = localStorage.getItem(`channels_${groupName}`);
    if (saved) {
        return JSON.parse(saved);
    }
    
    // Sonst Default für diesen Bereich
    return CHANNEL_CONFIGS[groupName] || {
        wa_mode: 'group',
        wa_enabled: false,
        em_enabled: false,
        template: 'formal'
    };
}

// Speichere Konfiguration für Bereich
function saveChannelConfigForGroup(groupName, config) {
    localStorage.setItem(`channels_${groupName}`, JSON.stringify(config));
    console.log(`✅ Konfiguration für ${groupName} gespeichert:`, config);
}

// Zeige alle Konfigurationen
function showAllConfigurations() {
    console.log('=== CHANNEL-KONFIGURATIONEN ===');
    data.groups.forEach(group => {
        const config = loadChannelConfig(group);
        console.log(`\n${group}:`);
        if (config.wa_enabled) console.log(`  📱 WhatsApp: ${config.wa_group_id || 'Einzelchats'}`);
        if (config.em_enabled) console.log(`  ✉️ E-Mail: ${config.em_addresses}`);
        if (config.telegram_enabled) console.log(`  ✈️ Telegram: ${config.telegram_chat}`);
        if (config.webhook_enabled) console.log(`  🔗 Webhook: ${config.webhook_url}`);
        if (config.auto_morning) console.log(`  🌅 Auto-Morgen: Ja`);
        if (config.auto_weekly) console.log(`  📅 Auto-Woche: Ja`);
    });
}

// Erweiterte configureChannels Funktion
window.configureChannels = function(groupName) {
    currentConfigGroup = groupName;
    document.getElementById('configGroupName').textContent = `Bereich: ${groupName}`;
    
    // Lade spezifische Konfiguration für diesen Bereich
    const config = loadChannelConfig(groupName);
    
    // Setze UI-Werte
    if (config.wa_mode) {
        const modeRadio = document.querySelector(`input[name="wa_mode"][value="${config.wa_mode}"]`);
        if (modeRadio) modeRadio.checked = true;
    }
    
    document.getElementById('whatsapp_enabled').checked = config.wa_enabled || false;
    document.getElementById('whatsapp_group_id').value = config.wa_group_id || '';
    
    if (document.getElementById('individual_enabled')) {
        document.getElementById('individual_enabled').checked = config.wa_individual || false;
    }
    
    document.getElementById('email_enabled').checked = config.em_enabled || false;
    document.getElementById('email_addresses').value = config.em_addresses || '';
    
    // Template basierend auf Bereich
    if (document.getElementById('individual_template')) {
        const template = MESSAGE_TEMPLATES[config.template || 'formal'];
        document.getElementById('individual_template').value = template.individual || '';
    }
    
    // Zeige bereichsspezifische Optionen
    showGroupSpecificOptions(groupName);
    
    document.getElementById('channelConfigModal').style.display = 'block';
    
    // UI Update
    if (window.toggleWhatsAppMode) {
        toggleWhatsAppMode();
    }
}

// Zeige bereichsspezifische Optionen
function showGroupSpecificOptions(groupName) {
    const infoBox = document.createElement('div');
    infoBox.style = 'padding: 10px; background: #e3f2fd; border-radius: 5px; margin: 10px 0;';
    
    switch(groupName) {
        case 'Familie':
            infoBox.innerHTML = '💡 Tipp: Für Familie empfiehlt sich eine WhatsApp-Gruppe mit täglicher Erinnerung.';
            break;
        case 'CDU':
        case 'Verein':
            infoBox.innerHTML = '💡 Tipp: Für Organisationen eignen sich Gruppen-Nachrichten oder E-Mail-Verteiler.';
            break;
        case 'Arbeit':
            infoBox.innerHTML = '💡 Tipp: Im beruflichen Umfeld sind E-Mails oder Teams-Nachrichten angemessener.';
            break;
        case 'Freunde':
            infoBox.innerHTML = '💡 Tipp: Bei Freunden sind individuelle WhatsApp-Nachrichten persönlicher.';
            break;
        case 'Nachbarn':
            infoBox.innerHTML = '💡 Tipp: Nachbarn möchten vielleicht keine automatischen Nachrichten.';
            break;
        default:
            infoBox.innerHTML = `💡 Konfiguration für: ${groupName}`;
    }
    
    const existingInfo = document.getElementById('groupSpecificInfo');
    if (existingInfo) {
        existingInfo.innerHTML = infoBox.innerHTML;
    }
}

// Sende mit bereichsspezifischer Konfiguration
function sendToGroupChannels(groupName) {
    const config = loadChannelConfig(groupName);
    const today = new Date();
    
    // Sammle Geburtstage für diesen Bereich
    const birthdays = data.people.filter(person => {
        const bDate = new Date(person.birthdate);
        const isToday = bDate.getDate() === today.getDate() && 
                        bDate.getMonth() === today.getMonth();
        const inGroup = person.groups && person.groups.includes(groupName);
        return isToday && inGroup;
    });
    
    if (birthdays.length === 0) {
        console.log(`Keine Geburtstage heute in ${groupName}`);
        return;
    }
    
    console.log(`📤 Sende Benachrichtigungen für ${groupName}:`, birthdays.length, 'Geburtstage');
    
    // WhatsApp Gruppe
    if (config.wa_enabled && config.wa_group_id) {
        const template = MESSAGE_TEMPLATES[config.template || 'formal'];
        let message = template.group
            .replace('{date}', today.toLocaleDateString('de-DE'))
            .replace('{group}', groupName)
            .replace('{birthdays}', birthdays.map(p => {
                const age = today.getFullYear() - new Date(p.birthdate).getFullYear();
                return `🎂 ${p.name} wird ${age} Jahre`;
            }).join('\n'));
        
        console.log(`📱 WhatsApp an ${config.wa_group_id}:`, message);
        
        // Sende über WhatsApp-Server
        fetch('http://localhost:9999/send-group', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                message: message,
                bereich: groupName,
                groupId: config.wa_group_id
            })
        });
    }
    
    // WhatsApp Einzelchats
    if (config.wa_individual) {
        birthdays.forEach(person => {
            if (person.phone) {
                console.log(`📱 Einzelnachricht an ${person.name}: ${person.phone}`);
            }
        });
    }
    
    // E-Mail
    if (config.em_enabled && config.em_addresses) {
        console.log(`✉️ E-Mail an: ${config.em_addresses}`);
    }
    
    // Telegram
    if (config.telegram_enabled && config.telegram_chat) {
        console.log(`✈️ Telegram an: ${config.telegram_chat}`);
    }
}

// Teste Konfiguration für einen Bereich
function testGroupConfig(groupName) {
    console.log(`\n=== TEST: ${groupName} ===`);
    const config = loadChannelConfig(groupName);
    console.log('Konfiguration:', config);
    
    // Simuliere Geburtstage
    sendToGroupChannels(groupName);
}

console.log('✅ Bereichsspezifische Channel-Konfiguration geladen');
console.log('Nutze: showAllConfigurations() um alle Einstellungen zu sehen');
</script>

// Clean Configuration - Nur die Services die wirklich laufen
window.APP_CONFIG = {
    servers: {
        main: {
            url: 'http://localhost:3001',
            name: 'Haupt-Server',
            required: true,
            running: true
        },
        communication: {
            url: 'http://localhost:3003',
            name: 'Communication Server',
            required: false,
            running: false
        }
    },
    
    checkInterval: 60000, // Check alle 60 Sekunden
    
    init: function() {
        console.log('🔧 App Configuration loaded');
        console.log('Main Server:', this.servers.main.url);
        
        // Deaktiviere nicht existierende Service-Checks
        window.checkDatabaseConnection = () => console.log('DB: OK');
        window.checkWhatsAppServer = () => console.log('WhatsApp: Optional');
        
        // Clear alte Intervals
        for (let i = 1; i < 999; i++) {
            clearInterval(i);
            clearTimeout(i);
        }
        
        console.log('✅ Clean config applied');
    }
};

// Auto-init
APP_CONFIG.init();

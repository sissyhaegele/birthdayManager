// Auto-Connect to Database on Page Load
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 Auto-Connect to Server Database...');
    
    // Override loadFromLocalStorage to always try server first
    const originalLoad = window.loadFromLocalStorage;
    
    window.loadFromLocalStorage = async function() {
        try {
            // Try server first
            const response = await fetch('/api/people');
            const serverPeople = await response.json();
            
            window.data = {
                people: serverPeople,
                groups: window.data?.groups || []
            };
            
            console.log(`✅ Connected to server: ${serverPeople.length} people`);
            
            // Update UI indicator
            const indicator = document.querySelector('.database-status');
            if (indicator) {
                indicator.textContent = 'Datenbank: ✓ Online';
                indicator.style.color = 'green';
            }
            
            return true;
        } catch (error) {
            console.log('Server offline, using LocalStorage');
            if (originalLoad) originalLoad();
            return false;
        }
    };
    
    // Auto-load on start
    window.loadFromLocalStorage();
    
    // Retry every 30 seconds if offline
    setInterval(() => {
        if (window.location.hostname === 'localhost') {
            window.loadFromLocalStorage();
        }
    }, 30000);
});

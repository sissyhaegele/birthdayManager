// dialog-with-groups.js
function initPersonDialog() {
    // Verfügbare Bereiche
    const availableGroups = window.data?.groups || [
        'Familie', 'Freunde', 'Arbeit', 'Verein', 
        'Nachbarn', 'Sport', 'Hobby', 'Schule'
    ];
    
    // Dialog HTML mit Bereiche-Checkliste
    const dialogHTML = `
        <div id="personDialog" class="person-dialog">
            <!-- Dialog mit Bereiche-Checkliste wie oben -->
        </div>
    `;
    
    // Nur hinzufügen wenn noch nicht vorhanden
    if (!document.getElementById('personDialog')) {
        document.body.insertAdjacentHTML('beforeend', dialogHTML);
    }
}

// Initialisiere beim Laden
document.addEventListener('DOMContentLoaded', initPersonDialog);

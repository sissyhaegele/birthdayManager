// ui-improvements.js - Moderne UI mit Icons
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎨 Lade UI-Verbesserungen...');
    
    // CSS für Icon-Buttons
    const style = document.createElement('style');
    style.textContent = `
        .icon-btn {
            border-radius: 50%;
            border: none;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        
        .icon-btn:hover {
            transform: translateY(-2px) scale(1.1);
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        
        .icon-btn.edit {
            width: 32px;
            height: 32px;
            background: #3498db;
            color: white;
            font-size: 16px;
        }
        
        .icon-btn.delete {
            width: 32px;
            height: 32px;
            background: #e74c3c;
            color: white;
            font-size: 16px;
        }
        
        .icon-btn.save {
            background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
            color: white;
            padding: 10px 24px;
            border-radius: 25px;
            width: auto;
            font-size: 16px;
            gap: 8px;
        }
        
        .icon-btn.add {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 28px;
            border-radius: 25px;
            width: auto;
            font-size: 16px;
            font-weight: 500;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }
        
        /* Tooltip für Icons */
        .icon-btn[title]:hover::after {
            content: attr(title);
            position: absolute;
            bottom: -30px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 12px;
            white-space: nowrap;
            z-index: 1000;
        }
    `;
    document.head.appendChild(style);
    
    // Konvertiere alle Buttons zu Icons
    function convertButtonsToIcons() {
        // Edit Buttons
        document.querySelectorAll('button').forEach(btn => {
            const onclick = btn.getAttribute('onclick') || '';
            
            if (onclick.includes('editPerson')) {
                btn.className = 'icon-btn edit';
                btn.innerHTML = '✏️';
                btn.title = 'Person bearbeiten';
            } else if (onclick.includes('deletePerson')) {
                btn.className = 'icon-btn delete';
                btn.innerHTML = '🗑️';
                btn.title = 'Person löschen';
            } else if (btn.textContent.includes('Speichern')) {
                btn.className = 'icon-btn save';
                btn.innerHTML = '💾 Speichern';
            } else if (btn.textContent.includes('Person hinzufügen')) {
                btn.className = 'icon-btn add';
                btn.innerHTML = '➕ Neue Person';
            }
        });
    }
    
    // Führe bei jedem Tab-Wechsel aus
    setInterval(convertButtonsToIcons, 500);
    convertButtonsToIcons();
    
    console.log('✅ UI-Verbesserungen geladen');
});

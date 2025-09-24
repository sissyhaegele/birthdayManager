// ux-improvements-complete.js - ALLE UX-Verbesserungen
(function initCompleteUX() {
    'use strict';
    
    console.log('🎨 Lade komplette UX-Verbesserungen...');
    
    // ========================================
    // 1. CSS STYLES FÜR MODERNE UI
    // ========================================
    const styles = `
        /* Icon Buttons */
        .icon-btn {
            border-radius: 50%;
            border: none;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            position: relative;
        }
        
        .icon-btn:hover {
            transform: translateY(-2px) scale(1.1);
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        
        .icon-btn.edit {
            width: 36px;
            height: 36px;
            background: #3498db;
            color: white;
            font-size: 18px;
        }
        
        .icon-btn.delete {
            width: 36px;
            height: 36px;
            background: #e74c3c;
            color: white;
            font-size: 18px;
        }
        
        .icon-btn.save {
            background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
            color: white;
            padding: 10px 24px;
            border-radius: 25px;
            width: auto;
            font-size: 16px;
        }
        
        .icon-btn.add {
            background: white;
            color: #667eea;
            padding: 12px 24px;
            border-radius: 25px;
            width: auto;
            font-size: 16px;
            font-weight: 500;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        /* Person Toolbar */
        #personToolbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 10px;
            margin-bottom: 20px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        
        /* Dialog Styles */
        #personDialogOverlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(5px);
            z-index: 9998;
            animation: fadeIn 0.3s;
        }
        
        #personDialog {
            display: none;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border-radius: 20px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            z-index: 9999;
            width: 90%;
            max-width: 700px;
            max-height: 85vh;
            overflow: hidden;
            animation: slideIn 0.3s;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes slideIn {
            from { 
                opacity: 0;
                transform: translate(-50%, -45%) scale(0.95);
            }
            to { 
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
            }
        }
        
        .dialog-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .dialog-body {
            padding: 30px;
            max-height: calc(85vh - 200px);
            overflow-y: auto;
        }
        
        .form-group {
            margin-bottom: 24px;
        }
        
        .form-label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #374151;
            font-size: 14px;
        }
        
        .form-control {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e5e7eb;
            border-radius: 10px;
            font-size: 15px;
            transition: all 0.3s;
            background: #f9fafb;
        }
        
        .form-control:focus {
            outline: none;
            border-color: #667eea;
            background: white;
            box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
        }
        
        /* Bereiche Checkbox Styling */
        .groups-container {
            background: #f9fafb;
            border: 2px solid #e5e7eb;
            border-radius: 10px;
            padding: 16px;
            max-height: 200px;
            overflow-y: auto;
        }
        
        .group-item {
            display: flex;
            align-items: center;
            padding: 8px;
            margin-bottom: 8px;
            background: white;
            border-radius: 8px;
            transition: all 0.2s;
            cursor: pointer;
        }
        
        .group-item:hover {
            background: #f3f4f6;
            transform: translateX(5px);
        }
        
        .group-item.checked {
            background: #ede9fe;
            border: 1px solid #667eea;
        }
        
        .group-item input[type="checkbox"] {
            width: 20px;
            height: 20px;
            margin-right: 12px;
            cursor: pointer;
            accent-color: #667eea;
        }
        
        .group-item label {
            cursor: pointer;
            user-select: none;
            font-size: 15px;
            color: #374151;
            flex: 1;
            display: flex;
            align-items: center;
        }
        
        .dialog-footer {
            padding: 20px 30px;
            background: #f9fafb;
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            border-top: 1px solid #e5e7eb;
        }
        
        .btn {
            padding: 12px 24px;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            font-size: 15px;
            font-weight: 600;
            transition: all 0.3s;
        }
        
        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }
        
        .btn-secondary {
            background: #6b7280;
            color: white;
        }
    `;
    
    // Füge Styles hinzu
    if (!document.getElementById('ux-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'ux-styles';
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }
    
    // ========================================
    // 2. ENTFERNE "PERSON HINZUFÜGEN" TAB
    // ========================================
    function removeAddPersonTab() {
        document.querySelectorAll('.tab-btn, .nav-link, button').forEach(element => {
            const text = element.textContent.trim();
            if ((text.includes('Person hinzufügen') || 
                 text.includes('Neue Person') || 
                 text === '➕ Neue Person') &&
                (element.closest('.tab-navigation') || 
                 element.closest('.nav-tabs') || 
                 element.closest('[role="tablist"]'))) {
                element.style.display = 'none';
                const parent = element.closest('li');
                if (parent) parent.style.display = 'none';
            }
        });
    }
    
    // ========================================
    // 3. FÜGE TOOLBAR MIT "NEUE PERSON" BUTTON HINZU
    // ========================================
    function addPersonToolbar() {
        const peopleContent = document.querySelector('#people-tab') || 
                             document.querySelector('#people-view') ||
                             document.querySelector('[id*="people"]:not([id*="add"])');
        
        if (peopleContent && !document.getElementById('personToolbar')) {
            const personCount = document.querySelectorAll('.person-item, tr[data-person-id]').length || 
                               window.data?.people?.length || 0;
            
            const toolbar = document.createElement('div');
            toolbar.id = 'personToolbar';
            toolbar.innerHTML = `
                <div style="color: white;">
                    <h2 style="margin: 0; font-size: 24px; font-weight: 500;">
                        👥 Personen-Übersicht
                    </h2>
                    <p style="margin: 5px 0; opacity: 0.9; font-size: 14px;">
                        ${personCount} Personen in der Datenbank
                    </p>
                </div>
                <button id="addPersonMainBtn" 
                        class="icon-btn add"
                        onclick="openPersonDialog()">
                    ➕ Neue Person
                </button>
            `;
            
            const firstElement = peopleContent.querySelector('h1, h2, table, .person-list');
            if (firstElement) {
                firstElement.insertAdjacentElement('beforebegin', toolbar);
            } else {
                peopleContent.insertBefore(toolbar, peopleContent.firstChild);
            }
        }
    }
    
    // ========================================
    // 4. KONVERTIERE BUTTONS ZU ICONS
    // ========================================
    function convertButtonsToIcons() {
        document.querySelectorAll('button').forEach(btn => {
            const onclick = btn.getAttribute('onclick') || '';
            const text = btn.textContent;
            
            // Edit Buttons
            if (onclick.includes('editPerson') || text.includes('Bearbeiten')) {
                btn.className = 'icon-btn edit';
                btn.innerHTML = '✏️';
                btn.title = 'Person bearbeiten';
                
                // Update onclick für Dialog
                const match = onclick.match(/editPerson\((\d+)\)/);
                if (match) {
                    btn.setAttribute('onclick', `openPersonDialog(${match[1]})`);
                }
            }
            // Delete Buttons
            else if (onclick.includes('deletePerson') || text.includes('Löschen')) {
                btn.className = 'icon-btn delete';
                btn.innerHTML = '🗑️';
                btn.title = 'Person löschen';
            }
            // Save Buttons
            else if (text.includes('Speichern') || text.includes('Save')) {
                if (!btn.classList.contains('icon-btn')) {
                    btn.className = 'icon-btn save';
                    btn.innerHTML = '💾 Speichern';
                }
            }
        });
    }
    
    // ========================================
    // 5. ERSTELLE DIALOG MIT BEREICHE
    // ========================================
    function createPersonDialog() {
        if (document.getElementById('personDialog')) return;
        
        const availableGroups = window.data?.groups || 
            ['Familie', 'Freunde', 'Arbeit', 'Verein', 'Nachbarn', 'Sport', 'Hobby'];
        
        const dialogHTML = `
            <div id="personDialogOverlay" onclick="closePersonDialog()"></div>
            <div id="personDialog">
                <div class="dialog-header">
                    <h2 style="margin: 0; font-size: 20px; font-weight: 600;">
                        <span id="dialogIcon">➕</span>
                        <span id="dialogTitle">Neue Person anlegen</span>
                    </h2>
                    <button style="background: transparent; border: none; color: white; font-size: 28px; cursor: pointer;" 
                            onclick="closePersonDialog()">✕</button>
                </div>
                
                <div class="dialog-body">
                    <form id="personDialogForm" onsubmit="savePersonFromDialog(event); return false;">
                        <div class="form-group">
                            <label class="form-label">👤 Name <span style="color: #ef4444;">*</span></label>
                            <input type="text" id="dialogName" class="form-control" placeholder="Max Mustermann" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">📅 Geburtsdatum <span style="color: #ef4444;">*</span></label>
                            <input type="date" id="dialogBirthdate" class="form-control" required>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div class="form-group">
                                <label class="form-label">📱 Telefon</label>
                                <input type="tel" id="dialogPhone" class="form-control" placeholder="+49 123 456789">
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">✉️ E-Mail</label>
                                <input type="email" id="dialogEmail" class="form-control" placeholder="max@example.com">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">🏷️ Bereiche / Gruppen</label>
                            <div class="groups-container" id="groupsContainer">
                                ${availableGroups.map(group => `
                                    <div class="group-item" data-group="${group}">
                                        <input type="checkbox" id="group_${group}" name="groups" value="${group}" 
                                               onchange="toggleGroupCheck(this)">
                                        <label for="group_${group}">${group}</label>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">📝 Notizen</label>
                            <textarea id="dialogNotes" class="form-control" rows="3" 
                                      placeholder="Zusätzliche Informationen..."></textarea>
                        </div>
                    </form>
                </div>
                
                <div class="dialog-footer">
                    <button type="button" class="btn btn-secondary" onclick="closePersonDialog()">
                        Abbrechen
                    </button>
                    <button type="submit" form="personDialogForm" class="btn btn-primary">
                        💾 Speichern
                    </button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', dialogHTML);
    }
    
    // ========================================
    // 6. DIALOG FUNKTIONEN
    // ========================================
    window.openPersonDialog = function(personId = null) {
        const dialog = document.getElementById('personDialog');
        const overlay = document.getElementById('personDialogOverlay');
        
        if (!dialog) {
            createPersonDialog();
        }
        
        const icon = document.getElementById('dialogIcon');
        const title = document.getElementById('dialogTitle');
        
        if (personId) {
            icon.textContent = '✏️';
            title.textContent = 'Person bearbeiten';
            window.editingPersonId = personId;
            
            const person = window.data?.people?.find(p => p.id == personId);
            if (person) {
                document.getElementById('dialogName').value = person.name || '';
                document.getElementById('dialogBirthdate').value = person.birthdate || '';
                document.getElementById('dialogPhone').value = person.phone || '';
                document.getElementById('dialogEmail').value = person.email || '';
                document.getElementById('dialogNotes').value = person.notes || '';
                
                // Setze Gruppen
                document.querySelectorAll('input[name="groups"]').forEach(cb => {
                    cb.checked = person.groups && person.groups.includes(cb.value);
                    toggleGroupCheck(cb);
                });
            }
        } else {
            icon.textContent = '➕';
            title.textContent = 'Neue Person anlegen';
            window.editingPersonId = null;
            document.getElementById('personDialogForm').reset();
            document.querySelectorAll('.group-item').forEach(item => {
                item.classList.remove('checked');
            });
        }
        
        document.getElementById('personDialog').style.display = 'block';
        document.getElementById('personDialogOverlay').style.display = 'block';
    };
    
    window.closePersonDialog = function() {
        const dialog = document.getElementById('personDialog');
        const overlay = document.getElementById('personDialogOverlay');
        if (dialog) dialog.style.display = 'none';
        if (overlay) overlay.style.display = 'none';
        window.editingPersonId = null;
    };
    
    window.savePersonFromDialog = function(event) {
        event.preventDefault();
        
        const selectedGroups = [];
        document.querySelectorAll('input[name="groups"]:checked').forEach(cb => {
            selectedGroups.push(cb.value);
        });
        
        const personData = {
            name: document.getElementById('dialogName').value,
            birthdate: document.getElementById('dialogBirthdate').value,
            phone: document.getElementById('dialogPhone').value,
            email: document.getElementById('dialogEmail').value,
            notes: document.getElementById('dialogNotes').value,
            groups: selectedGroups
        };
        
        if (window.editingPersonId) {
            personData.id = window.editingPersonId;
            fetch('/api/people/' + personData.id, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(personData)
            }).then(() => {
                closePersonDialog();
                location.reload();
            }).catch(() => {
                closePersonDialog();
                location.reload();
            });
        } else {
            personData.id = Date.now();
            fetch('/api/people', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(personData)
            }).then(() => {
                closePersonDialog();
                location.reload();
            }).catch(() => {
                closePersonDialog();
                location.reload();
            });
        }
    };
    
    window.toggleGroupCheck = function(checkbox) {
        const groupItem = checkbox.closest('.group-item');
        if (groupItem) {
            if (checkbox.checked) {
                groupItem.classList.add('checked');
            } else {
                groupItem.classList.remove('checked');
            }
        }
    };
    
    // ========================================
    // 7. INITIALISIERUNG
    // ========================================
    function initUX() {
        removeAddPersonTab();
        setTimeout(() => {
            addPersonToolbar();
            convertButtonsToIcons();
            createPersonDialog();
        }, 100);
        
        // Wiederhole für dynamisch geladene Inhalte
        setInterval(() => {
            removeAddPersonTab();
            convertButtonsToIcons();
        }, 1000);
    }
    
    // Start wenn DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initUX);
    } else {
        initUX();
    }
    
    console.log('✅ Komplette UX-Verbesserungen geladen!');
})();

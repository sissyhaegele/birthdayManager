// birthday-manager-ux.js - FUNKTIONIERENDER STAND
(function() {
    'use strict';
    
    console.log('🎨 Lade UX-Verbesserungen (funktionierender Stand)...');
    
    function initUX() {
        // ============================================
        // ENTFERNE TAB "PERSON HINZUFÜGEN"
        // ============================================
        function removeAddPersonTab() {
            document.querySelectorAll('.tab-btn, .nav-link, .nav-item, button, a').forEach(element => {
                const text = element.textContent.trim();
                
                if (text.includes('Person hinzufügen') || 
                    text.includes('Add Person') || 
                    text.includes('Neue Person')) {
                    
                    const isInTabNav = element.closest('.tab-navigation') || 
                                      element.closest('.nav-tabs') || 
                                      element.closest('[role="tablist"]') ||
                                      element.closest('.tabs');
                    
                    if (isInTabNav) {
                        const parent = element.closest('li');
                        if (parent) {
                            parent.remove();
                        } else {
                            element.remove();
                        }
                    }
                }
            });
            
            document.querySelectorAll('#add-person-tab, .tab-content').forEach(content => {
                if (content.innerHTML && content.innerHTML.includes('Neue Person hinzufügen')) {
                    content.style.display = 'none';
                }
            });
        }
        
        // ============================================
        // FÜGE TOOLBAR MIT BUTTON HINZU - GENAU WIE ES FUNKTIONIERT
        // ============================================
        function addToolbar() {
            setTimeout(() => {
                // Entferne alte Toolbar
                const oldToolbar = document.getElementById('personToolbar');
                if (oldToolbar) {
                    oldToolbar.remove();
                }
                
                // Finde die richtige Stelle
                const peopleSection = document.querySelector('#people-tab') || 
                                     document.querySelector('#people-view') ||
                                     document.querySelector('.tab-content.active') ||
                                     document.querySelector('table') ||
                                     document.querySelector('[id*="people"]');
                
                // Zähle Personen
                const personCount = document.querySelectorAll('tr[data-person-id], tbody tr').length - 1 || 
                                   window.data?.people?.length || 0;
                
                // Erstelle Toolbar
                const toolbar = document.createElement('div');
                toolbar.id = 'personToolbar';
                toolbar.style.cssText = `
                    display: flex !important;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 10px;
                    margin-bottom: 20px;
                    margin-top: 10px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                `;
                
                toolbar.innerHTML = `
                    <div style="color: white;">
                        <h2 style="margin: 0; font-size: 24px; font-weight: 500;">
                            👥 Personen-Verwaltung
                        </h2>
                        <p style="margin: 5px 0; opacity: 0.9; font-size: 14px;">
                            ${personCount} Personen in der Datenbank
                        </p>
                    </div>
                    <button id="addPersonMainButton" 
                            onclick="openPersonDialog()"
                            style="
                                background: white !important;
                                color: #667eea !important;
                                border: none;
                                padding: 12px 24px;
                                border-radius: 25px;
                                cursor: pointer;
                                font-size: 16px;
                                font-weight: 500;
                                display: flex;
                                align-items: center;
                                gap: 8px;
                                transition: all 0.3s;
                                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                            "
                            onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 20px rgba(0,0,0,0.2)';"
                            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 10px rgba(0,0,0,0.1)';">
                        ➕ Neue Person
                    </button>
                `;
                
                // Füge Toolbar ein
                if (peopleSection) {
                    const table = peopleSection.querySelector('table') || document.querySelector('table');
                    const heading = peopleSection.querySelector('h1, h2, h3');
                    
                    if (table) {
                        table.parentNode.insertBefore(toolbar, table);
                    } else if (heading) {
                        heading.insertAdjacentElement('afterend', toolbar);
                    } else {
                        peopleSection.insertBefore(toolbar, peopleSection.firstChild);
                    }
                } else {
                    const anyTable = document.querySelector('table');
                    if (anyTable) {
                        anyTable.parentNode.insertBefore(toolbar, anyTable);
                    }
                }
            }, 100);
        }
        
        // ============================================
        // ERSTELLE DIALOG - GENAU WIE ES FUNKTIONIERT
        // ============================================
        function createDialog() {
            if (!document.getElementById('personDialog')) {
                const dialogHTML = `
                    <div id="personDialogOverlay" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); z-index: 9998;" onclick="closePersonDialog()"></div>
                    <div id="personDialog" style="display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; border-radius: 20px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); z-index: 9999; width: 90%; max-width: 700px; max-height: 90vh; overflow: hidden;">
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 24px; display: flex; justify-content: space-between; align-items: center;">
                            <h2 style="margin: 0;">➕ Neue Person anlegen</h2>
                            <button onclick="closePersonDialog()" style="background: transparent; border: none; color: white; font-size: 28px; cursor: pointer;">✕</button>
                        </div>
                        <div style="padding: 30px;">
                            <form onsubmit="savePersonFromDialog(event); return false;">
                                <div style="margin-bottom: 20px;">
                                    <label style="display: block; margin-bottom: 8px; font-weight: 600;">Name *</label>
                                    <input type="text" id="dialogName" required style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 10px;">
                                </div>
                                <div style="margin-bottom: 20px;">
                                    <label style="display: block; margin-bottom: 8px; font-weight: 600;">Geburtsdatum *</label>
                                    <input type="date" id="dialogBirthdate" required style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 10px;">
                                </div>
                                <div style="margin-bottom: 20px;">
                                    <label style="display: block; margin-bottom: 8px; font-weight: 600;">Bereiche</label>
                                    <div style="background: #f9fafb; border: 2px solid #e5e7eb; border-radius: 10px; padding: 16px;">
                                        <label style="display: block; margin: 5px;"><input type="checkbox" name="groups" value="Familie"> Familie</label>
                                        <label style="display: block; margin: 5px;"><input type="checkbox" name="groups" value="Freunde"> Freunde</label>
                                        <label style="display: block; margin: 5px;"><input type="checkbox" name="groups" value="Arbeit"> Arbeit</label>
                                        <label style="display: block; margin: 5px;"><input type="checkbox" name="groups" value="Verein"> Verein</label>
                                    </div>
                                </div>
                                <div style="display: flex; justify-content: flex-end; gap: 12px;">
                                    <button type="button" onclick="closePersonDialog()" style="padding: 12px 24px; background: #6b7280; color: white; border: none; border-radius: 10px; cursor: pointer;">Abbrechen</button>
                                    <button type="submit" style="padding: 12px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 10px; cursor: pointer;">💾 Speichern</button>
                                </div>
                            </form>
                        </div>
                    </div>
                `;
                
                document.body.insertAdjacentHTML('beforeend', dialogHTML);
            }
        }
        
        // ============================================
        // DIALOG FUNKTIONEN
        // ============================================
        window.openPersonDialog = function() {
            const dialog = document.getElementById('personDialog');
            const overlay = document.getElementById('personDialogOverlay');
            
            if (dialog && overlay) {
                dialog.style.display = 'block';
                overlay.style.display = 'block';
            }
        };
        
        window.closePersonDialog = function() {
            const dialog = document.getElementById('personDialog');
            const overlay = document.getElementById('personDialogOverlay');
            
            if (dialog && overlay) {
                dialog.style.display = 'none';
                overlay.style.display = 'none';
            }
        };
        
        window.savePersonFromDialog = function(event) {
            event.preventDefault();
            
            const selectedGroups = [];
            document.querySelectorAll('input[name="groups"]:checked').forEach(cb => {
                selectedGroups.push(cb.value);
            });
            
            const person = {
                id: Date.now(),
                name: document.getElementById('dialogName').value,
                birthdate: document.getElementById('dialogBirthdate').value,
                groups: selectedGroups
            };
            
            console.log('💾 Speichere Person:', person);
            
            if (!window.data) window.data = { people: [] };
            window.data.people.push(person);
            
            closePersonDialog();
            location.reload();
        };
        
        // ============================================
        // ICON BUTTONS
        // ============================================
        function convertButtonsToIcons() {
            document.querySelectorAll('button').forEach(btn => {
                const onclick = btn.getAttribute('onclick') || '';
                const text = btn.textContent;
                
                if (onclick.includes('editPerson') || text.includes('Bearbeiten')) {
                    btn.style.cssText = `
                        width: 36px;
                        height: 36px;
                        padding: 0;
                        background: #3498db;
                        color: white;
                        border: none;
                        border-radius: 50%;
                        cursor: pointer;
                        font-size: 18px;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.3s;
                        margin: 0 4px;
                    `;
                    btn.innerHTML = '✏️';
                    btn.title = 'Person bearbeiten';
                }
                else if (onclick.includes('deletePerson') || text.includes('Löschen')) {
                    btn.style.cssText = `
                        width: 36px;
                        height: 36px;
                        padding: 0;
                        background: #e74c3c;
                        color: white;
                        border: none;
                        border-radius: 50%;
                        cursor: pointer;
                        font-size: 18px;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.3s;
                        margin: 0 4px;
                    `;
                    btn.innerHTML = '🗑️';
                    btn.title = 'Person löschen';
                }
            });
        }
        
        // ============================================
        // AUSFÜHRUNG
        // ============================================
        removeAddPersonTab();
        addToolbar();
        createDialog();
        convertButtonsToIcons();
        
        // Wiederhole für dynamische Inhalte
        setInterval(() => {
            removeAddPersonTab();
            convertButtonsToIcons();
            
            // Stelle sicher dass Toolbar da bleibt
            if (!document.getElementById('personToolbar')) {
                addToolbar();
            }
        }, 1000);
        
        console.log('✅ UX-Verbesserungen geladen (funktionierender Stand)');
    }
    
    // Starte
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initUX);
    } else {
        initUX();
    }
})();

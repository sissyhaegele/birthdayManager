# 🎂 Birthday Manager - Windows Setup Guide

## 🚀 Schnellstart (Windows)

### Option 1: Automatisches Setup (Empfohlen)

1. **PowerShell als Administrator öffnen**
   - Windows-Taste + X drücken
   - "Windows PowerShell (Administrator)" auswählen

2. **Execution Policy setzen** (einmalig)
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

3. **Setup-Skript ausführen**
   ```powershell
   .\setup.ps1
   ```
   Dieses Skript installiert automatisch alle benötigten Tools:
   - Node.js
   - Yarn
   - Git (optional)
   - VS Code (optional)

4. **Anwendung starten**
   ```powershell
   .\start.ps1
   ```
   Oder doppelklicken Sie auf `start.ps1`

### Option 2: Manuelle Installation

#### Voraussetzungen installieren:

1. **Node.js installieren**
   - Download von: https://nodejs.org/
   - LTS Version wählen
   - Installer ausführen

2. **Yarn installieren**
   ```cmd
   npm install -g yarn
   ```
   Oder Download von: https://yarnpkg.com/latest.msi

3. **Projekt einrichten**
   ```cmd
   yarn install
   ```

4. **Entwicklungsserver starten**
   ```cmd
   yarn dev
   ```

## 📦 Deployment (Windows)

### PowerShell Deployment-Skript

```powershell
# Hilfe anzeigen
.\deploy.ps1

# Entwicklungsserver starten
.\deploy.ps1 dev

# Production Build erstellen
.\deploy.ps1 build

# Deployment Bundle erstellen (.zip)
.\deploy.ps1 bundle

# Zu Vercel deployen
.\deploy.ps1 vercel

# Zu Netlify deployen
.\deploy.ps1 netlify

# Docker Container starten
.\deploy.ps1 docker
```

### Batch-Datei Alternative

```cmd
REM Entwicklungsserver starten
deploy.bat dev

REM Production Build
deploy.bat build

REM Bundle erstellen
deploy.bat bundle
```

## 🛠️ Verfügbare Skripte

| Skript | Beschreibung | Verwendung |
|--------|-------------|------------|
| `setup.ps1` | Installiert alle Abhängigkeiten | `.\setup.ps1` |
| `start.ps1` | Startet den Dev-Server | `.\start.ps1` |
| `deploy.ps1` | Deployment & Build Tools | `.\deploy.ps1 [command]` |
| `deploy.bat` | Batch Alternative | `deploy.bat [command]` |

## 🐳 Docker unter Windows

### Docker Desktop installieren:
1. Download von: https://www.docker.com/products/docker-desktop
2. Installer ausführen
3. Windows neu starten

### Docker Container starten:
```powershell
# Mit PowerShell
.\deploy.ps1 docker

# Oder manuell
docker build -t birthday-manager .
docker run -d -p 3000:80 birthday-manager
```

Anwendung läuft dann unter: http://localhost:3000

## 📊 CSV-Import Format

Die CSV-Datei muss UTF-8 kodiert sein und Semikolon (;) als Trennzeichen verwenden:

```csv
Vorname;Nachname;Geburtstag;Gruppen;E-Mail;Telefon;Notizen
Max;Mustermann;15.03.1985;Familie,Freunde;max@example.com;0171-2345678;Mag Bücher
```

**Tipp für Excel-Nutzer:**
- Beim Speichern "CSV UTF-8 (Trennzeichen-getrennt)" wählen
- Oder in Excel: Daten → Text in Spalten → Semikolon als Trennzeichen

## 🔧 Fehlerbehebung

### "Skript kann nicht ausgeführt werden"
```powershell
# In PowerShell als Administrator:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### "Yarn wurde nicht gefunden"
```powershell
# Option 1: Mit npm installieren
npm install -g yarn

# Option 2: Mit Chocolatey
choco install yarn

# Option 3: MSI Installer
# Download von https://yarnpkg.com/latest.msi
```

### "Port 3001 ist bereits belegt"
```powershell
# Prozess auf Port 3001 finden und beenden
netstat -ano | findstr :3001
taskkill /PID <PID-NUMMER> /F
```

### Build-Fehler beheben
```powershell
# Cache und node_modules löschen
.\deploy.ps1 clean

# Neu installieren
yarn install

# Erneut versuchen
yarn build
```

## 💻 Systemanforderungen

- Windows 10/11
- Node.js 18.0.0 oder höher
- 4 GB RAM (empfohlen)
- 500 MB freier Speicherplatz

## 🌐 Browser-Kompatibilität

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## 📁 Projektstruktur

```
birthday-manager-app/
├── deploy.ps1          # PowerShell Deployment-Skript
├── deploy.bat          # Batch Deployment-Skript
├── setup.ps1           # Setup-Skript für Windows
├── start.ps1           # Quick-Start Skript
├── package.json        # NPM/Yarn Konfiguration
├── src/               
│   ├── components/     # React Komponenten
│   └── utils/          # Hilfsfunktionen
└── dist/              # Production Build (nach yarn build)
```

## 🆘 Support

Bei Problemen:
1. Führen Sie `.\setup.ps1` erneut aus
2. Löschen Sie `node_modules` und führen Sie `yarn install` aus
3. Starten Sie Windows neu
4. Erstellen Sie ein Issue auf GitHub

## 🎯 Quick Commands

```powershell
# Alles neu installieren
Remove-Item node_modules -Recurse -Force
yarn install

# Server starten mit automatischem Browser-Öffnen
.\start.ps1

# Production Build testen
.\deploy.ps1 preview

# Deployment Bundle für Web-Server
.\deploy.ps1 bundle
```

---

**Tipp:** Erstellen Sie eine Verknüpfung zu `start.ps1` auf Ihrem Desktop für schnellen Zugriff!

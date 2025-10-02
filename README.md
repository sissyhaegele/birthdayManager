# 🎂 Birthday Manager

Eine moderne Webanwendung zur Verwaltung von Kontakten und Geburtstagen mit lokaler Speicherung.

## ✨ Features

- 📅 **Geburtstagskalender** - Übersicht über anstehende Geburtstage
- 👥 **Kontaktverwaltung** - Erstellen, bearbeiten und löschen von Kontakten
- 🏷️ **Gruppensystem** - Mehrfachzuordnung zu Gruppen (Familie, Freunde, CDU, etc.)
- 💾 **Lokale Speicherung** - Alle Daten werden lokal in IndexedDB gespeichert
- 📊 **CSV Import/Export** - Bulk-Import und Export von Kontakten
- 🔍 **Suche & Filter** - Schnelles Finden von Kontakten
- 📱 **Responsive Design** - Optimiert für Desktop und Mobile
- 🇩🇪 **Deutsches Datumsformat** - TT.MM.JJJJ

## 🚀 Installation

### Voraussetzungen

- Node.js >= 18.0.0
- Yarn >= 1.22.0

### Installation mit Yarn

```bash
# Repository klonen
git clone https://github.com/sissyhaegele/birthdayManager.git
cd BirthdayManager

# Dependencies installieren
yarn install

# Entwicklungsserver starten
yarn dev
```

Die Anwendung ist nun unter `http://localhost:3003` verfügbar.

## 📦 Production Build

### Build erstellen

```bash
# Production Build erstellen
yarn build

# Build lokal testen
yarn preview
```

Der Build wird im `dist` Verzeichnis erstellt und kann auf jedem Webserver deployed werden.

## 📊 CSV Format

### Import Format

Die CSV-Datei muss mit Semikolon (;) getrennt sein:

```csv
Vorname;Nachname;Geburtstag;Gruppen;E-Mail;Telefon;Notizen
Max;Mustermann;15.03.1985;Familie,Freunde;max@example.com;0171-2345678;Mag Bücher
Anna;Schmidt;22.08.1990;CDU,Kollegen;anna@example.com;0151-3456789;Liebt Schokolade
```

### Spalten

- **Vorname**: Text (Optional wenn Nachname vorhanden)
- **Nachname**: Text (Optional wenn Vorname vorhanden)  
- **Geburtstag**: Deutsches Format TT.MM.JJJJ
- **Gruppen**: Komma-getrennte Liste
- **E-Mail**: E-Mail-Adresse (Optional)
- **Telefon**: Telefonnummer (Optional)
- **Notizen**: Freitext (Optional)

## 🛠️ Entwicklung

### Verfügbare Scripts

```bash
# Entwicklungsserver starten
yarn dev

# Production Build erstellen
yarn build

# Build Preview
yarn preview
```

### Projektstruktur

```
BirthdayManager/
├── src/
│   ├── components/          # React Komponenten
│   │   ├── BirthdayManager.jsx
│   │   └── ContactCards.jsx
│   ├── utils/              # Hilfsfunktionen
│   │   └── autoBackup.js   # Auto-Backup System
│   ├── App.jsx             # Hauptkomponente
│   ├── main.jsx            # Einstiegspunkt
│   └── index.css           # Globale Styles
├── public/                 # Statische Dateien
│   ├── manifest.json       # PWA Manifest
│   └── sw.js              # Service Worker
├── package.json            # Dependencies
├── vite.config.js         # Vite Konfiguration
├── tailwind.config.js     # Tailwind Konfiguration
└── README.md              # Dokumentation
```

## 🔧 Technologie-Stack

- **React** - UI Framework
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **IndexedDB** - Lokale Datenspeicherung
- **Lucide Icons** - Icon-Bibliothek

## 📱 PWA Features

Die App kann als Progressive Web App installiert werden:
- Offline-Fähigkeit
- Desktop-Installation
- App-Icon und Splash-Screen

## 🔒 Datenschutz

- Alle Daten werden lokal in IndexedDB gespeichert
- Keine Server-Kommunikation
- Keine Tracking oder Analytics
- Vollständige Datenkontrolle beim Nutzer

## 📧 Browser-Kompatibilität

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Benötigt IndexedDB Unterstützung

## 🐛 Bekannte Probleme

- IndexedDB ist in privaten Browserfenstern limitiert
- CSV-Import mit sehr großen Dateien (>10MB) kann langsam sein

---

## Copyright & Lizenz

Copyright © 2025 Sissy Hägele - Alle Rechte vorbehalten

Dieses Projekt ist privates Eigentum und nicht zur öffentlichen Nutzung freigegeben.

This is proprietary software. All rights reserved.
No part of this software may be used, copied, modified, or distributed 
without explicit written permission from the copyright holder.

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
git clone <your-repo-url>
cd birthday-manager-app

# Dependencies installieren
yarn install

# Entwicklungsserver starten
yarn dev
```

Die Anwendung ist nun unter `http://localhost:3001` verfügbar.

## 📦 Deployment

### Production Build erstellen

```bash
# Production Build erstellen
yarn build

# Build lokal testen
yarn preview
```

Der Build wird im `dist` Verzeichnis erstellt und kann auf jedem Webserver deployed werden.

### Deployment Optionen

#### 1. **Vercel** (Empfohlen)

```bash
# Vercel CLI installieren
yarn global add vercel

# Deployen
vercel --prod
```

#### 2. **Netlify**

```bash
# Netlify CLI installieren
yarn global add netlify-cli

# Deployen
netlify deploy --prod --dir=dist
```

#### 3. **GitHub Pages**

```bash
# gh-pages Package installieren
yarn add --dev gh-pages

# Deploy Script zu package.json hinzufügen
"scripts": {
  "deploy": "yarn build && gh-pages -d dist"
}

# Deployen
yarn deploy
```

#### 4. **Docker**

```dockerfile
# Dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
# Docker Image bauen
docker build -t birthday-manager .

# Container starten
docker run -p 8080:80 birthday-manager
```

#### 5. **Traditioneller Webserver**

Nach dem Build können Sie den Inhalt des `dist` Ordners auf jeden Webserver (Apache, Nginx, etc.) hochladen.

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

# Code Linting
yarn lint
```

### Projektstruktur

```
birthday-manager-app/
├── src/
│   ├── components/       # React Komponenten
│   │   ├── BirthdayManager.jsx
│   │   ├── ContactForm.jsx
│   │   ├── ContactList.jsx
│   │   ├── GroupManager.jsx
│   │   ├── ImportExport.jsx
│   │   └── Statistics.jsx
│   ├── utils/           # Hilfsfunktionen
│   │   ├── database.js  # IndexedDB Operationen
│   │   ├── dateHelpers.js # Datumsfunktionen
│   │   └── csvUtils.js  # CSV Import/Export
│   ├── App.jsx          # Hauptkomponente
│   ├── main.jsx         # Einstiegspunkt
│   └── index.css        # Globale Styles
├── public/              # Statische Dateien
├── package.json         # Dependencies
├── vite.config.js       # Vite Konfiguration
├── tailwind.config.js   # Tailwind Konfiguration
└── README.md           # Dokumentation
```

## 🔧 Konfiguration

### Umgebungsvariablen

Erstellen Sie eine `.env` Datei für lokale Entwicklung:

```env
VITE_APP_NAME=Birthday Manager
VITE_APP_VERSION=1.0.0
```

### Browser-Kompatibilität

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Benötigt IndexedDB Unterstützung

## 📝 Lizenz

MIT License

## 👥 Beitragen

1. Fork erstellen
2. Feature Branch erstellen (`git checkout -b feature/AmazingFeature`)
3. Änderungen committen (`git commit -m 'Add some AmazingFeature'`)
4. Branch pushen (`git push origin feature/AmazingFeature`)
5. Pull Request erstellen

## 🐛 Bekannte Probleme

- IndexedDB ist in privaten Browserfenstern limitiert
- CSV-Import mit sehr großen Dateien (>10MB) kann langsam sein

## 📧 Support

Bei Fragen oder Problemen erstellen Sie bitte ein Issue im GitHub Repository.

---

Made with ❤️ using React, Vite, and Tailwind CSS

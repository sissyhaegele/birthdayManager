# ðŸŽ‚ Birthday Manager

Eine moderne Webanwendung zur Verwaltung von Kontakten und Geburtstagen mit lokaler Speicherung.

## âœ¨ Features

- ðŸ“… **Geburtstagskalender** - Ãœbersicht Ã¼ber anstehende Geburtstage
- ðŸ‘¥ **Kontaktverwaltung** - Erstellen, bearbeiten und lÃ¶schen von Kontakten
- ðŸ·ï¸ **Gruppensystem** - Mehrfachzuordnung zu Gruppen (Familie, Freunde, CDU, etc.)
- ðŸ’¾ **Lokale Speicherung** - Alle Daten werden lokal in IndexedDB gespeichert
- ðŸ“Š **CSV Import/Export** - Bulk-Import und Export von Kontakten
- ðŸ” **Suche & Filter** - Schnelles Finden von Kontakten
- ðŸ“± **Responsive Design** - Optimiert fÃ¼r Desktop und Mobile
- ðŸ‡©ðŸ‡ª **Deutsches Datumsformat** - TT.MM.JJJJ

## ðŸš€ Installation

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

Die Anwendung ist nun unter `http://localhost:3001` verfÃ¼gbar.

## ðŸ“¦ Deployment

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

# Deploy Script zu package.json hinzufÃ¼gen
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

Nach dem Build kÃ¶nnen Sie den Inhalt des `dist` Ordners auf jeden Webserver (Apache, Nginx, etc.) hochladen.

## ðŸ“Š CSV Format

### Import Format

Die CSV-Datei muss mit Semikolon (;) getrennt sein:

```csv
Vorname;Nachname;Geburtstag;Gruppen;E-Mail;Telefon;Notizen
Max;Mustermann;15.03.1985;Familie,Freunde;max@example.com;0171-2345678;Mag BÃ¼cher
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

## ðŸ› ï¸ Entwicklung

### VerfÃ¼gbare Scripts

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
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ components/       # React Komponenten
â”‚   â”‚   â”œâ”€â”€ BirthdayManager.jsx
â”‚   â”‚   â”œâ”€â”€ ContactForm.jsx
â”‚   â”‚   â”œâ”€â”€ ContactList.jsx
â”‚   â”‚   â”œâ”€â”€ GroupManager.jsx
â”‚   â”‚   â”œâ”€â”€ ImportExport.jsx
â”‚   â”‚   â””â”€â”€ Statistics.jsx
â”‚   â”œâ”€â”€ utils/           # Hilfsfunktionen
â”‚   â”‚   â”œâ”€â”€ database.js  # IndexedDB Operationen
â”‚   â”‚   â”œâ”€â”€ dateHelpers.js # Datumsfunktionen
â”‚   â”‚   â””â”€â”€ csvUtils.js  # CSV Import/Export
â”‚   â”œâ”€â”€ App.jsx          # Hauptkomponente
â”‚   â”œâ”€â”€ main.jsx         # Einstiegspunkt
â”‚   â””â”€â”€ index.css        # Globale Styles
â”œâ”€â”€ public/              # Statische Dateien
â”œâ”€â”€ package.json         # Dependencies
â”œâ”€â”€ vite.config.js       # Vite Konfiguration
â”œâ”€â”€ tailwind.config.js   # Tailwind Konfiguration
â””â”€â”€ README.md           # Dokumentation
```

## ðŸ”§ Konfiguration

### Umgebungsvariablen

Erstellen Sie eine `.env` Datei fÃ¼r lokale Entwicklung:

```env
VITE_APP_NAME=Birthday Manager
VITE_APP_VERSION=1.0.0
```

### Browser-KompatibilitÃ¤t

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- BenÃ¶tigt IndexedDB UnterstÃ¼tzung

## ðŸ“ Lizenz

MIT License

## ðŸ‘¥ Beitragen

1. Fork erstellen
2. Feature Branch erstellen (`git checkout -b feature/AmazingFeature`)
3. Ã„nderungen committen (`git commit -m 'Add some AmazingFeature'`)
4. Branch pushen (`git push origin feature/AmazingFeature`)
5. Pull Request erstellen

## ðŸ› Bekannte Probleme

- IndexedDB ist in privaten Browserfenstern limitiert
- CSV-Import mit sehr groÃŸen Dateien (>10MB) kann langsam sein

## ðŸ“§ Support

Bei Fragen oder Problemen erstellen Sie bitte ein Issue im GitHub Repository.

---

Made with â¤ï¸ using React, Vite, and Tailwind CSS

---

## Copyright & Lizenz

Copyright © 2025 Sissy Hägele - Alle Rechte vorbehalten

Dieses Projekt ist privates Eigentum und nicht zur öffentlichen Nutzung freigegeben.


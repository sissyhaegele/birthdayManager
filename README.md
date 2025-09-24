# BirthdayManager

Eine moderne Web-Anwendung zur Verwaltung von Geburtstagen mit WhatsApp-Integration.

## Features
- Bereiche statt Gruppen (Verein, CDU, Familie, Freunde, etc.)
- WhatsApp Integration - Direkte Nachrichten an Gruppen
- Lokale Speicherung - Keine Server erforderlich
- Erinnerungen - Automatische Benachrichtigungen
- Multi-Bereich Support - Eine Person kann mehreren Bereichen zugeordnet werden
- Import/Export - CSV mit korrekter Umlaut-Unterstützung

## Installation
1. Server starten: .\server.ps1
2. App öffnen: BirthdayManager.html

## Verwendung
1. Bereiche anlegen
2. Personen hinzufügen (können mehreren Bereichen zugeordnet werden)
3. WhatsApp-Button für Nachrichten nutzen

## CSV-Import Format
Bereiche mit Semikolon (;) trennen für Multi-Bereich-Zuordnung.

## WhatsApp-Integration
Der WhatsApp-Server muss laufen (server.ps1) für die Integration.

## Technologie
- HTML5/CSS3/JavaScript
- PowerShell Server
- LocalStorage für Daten
- UTF-8 Encoding

## Autor
Sissy Hägele

## Lizenz
MIT

## Update September 2025

### Neue Features:
- SQLite Datenbank-Support
- Hybrid-Modus (automatischer Wechsel zwischen LocalStorage und Datenbank)
- Verbesserte Server-Architektur
- Ein-Klick-Start über Desktop-Verknüpfung

### Server-Ports:
- Port 3000: Datenbank-Server
- Port 9999: WhatsApp-Server

self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  // Übernimmt sofort die Kontrolle über alle Clients
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Nur netzwerk-basierte Requests abfangen (keine chrome-extension:// etc.)
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .catch((error) => {
        console.error('Fetch failed:', error);
        // Fallback: Zeige eine Fehlerseite oder leere Response
        return new Response(
          JSON.stringify({ 
            error: 'Service nicht erreichbar',
            message: 'Der Server ist offline oder konnte nicht erreicht werden.'
          }), 
          {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'application/json' }
          }
        );
      })
  );
});

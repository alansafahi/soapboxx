// Service Worker for Push Notifications
self.addEventListener('push', function(event) {
  if (!event.data) {
    return;
  }

  try {
    const data = event.data.json();
    const options = {
      body: data.body || data.message,
      icon: data.icon || '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || data.actionUrl || '/',
        timestamp: Date.now(),
        ...data.data
      },
      actions: data.actions || [
        {
          action: 'view',
          title: 'View',
          icon: '/icons/icon-192x192.png'
        }
      ],
      requireInteraction: data.requireInteraction || false,
      tag: data.tag || 'spiritual-notification'
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  } catch (error) {
    // Fallback notification
    event.waitUntil(
      self.registration.showNotification('SoapBox Update', {
        body: 'You have a new spiritual update!',
        icon: '/icons/icon-192x192.png',
        data: { url: '/' }
      })
    );
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  const urlToOpen = event.notification.data.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // Check if there's already a window/tab open with the target URL
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If no matching client is found, open a new window/tab
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

self.addEventListener('notificationclose', function(event) {
  // Analytics or cleanup when notification is dismissed
});

// Background sync for offline support
self.addEventListener('sync', function(event) {
  if (event.tag === 'spiritual-checkin-sync') {
    event.waitUntil(syncWeeklyCheckin());
  }
});

async function syncWeeklyCheckin() {
  // Sync any pending weekly check-ins when back online
  try {
    const response = await fetch('/api/weekly-checkin/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (response.ok) {
      // Weekly check-in synced successfully
    }
  } catch (error) {
    // Failed to sync weekly check-in
  }
}

// Install event
self.addEventListener('install', function(event) {
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', function(event) {
  event.waitUntil(clients.claim());
});
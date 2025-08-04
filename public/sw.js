// Service Worker for Push Notifications
const CACHE_NAME = 'soapbox-v1';
const STATIC_CACHE_URLS = [
  '/',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/badge-72x72.png'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_CACHE_URLS);
    })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Push event
self.addEventListener('push', (event) => {
  if (!event.data) {
    return;
  }

  try {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: data.icon || '/icons/icon-192x192.png',
      badge: data.badge || '/icons/badge-72x72.png',
      image: data.image,
      tag: data.tag || 'soapbox-notification',
      data: data.data || {},
      actions: data.actions || [],
      requireInteraction: data.requireInteraction || false,
      silent: false,
      vibrate: [200, 100, 200]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  } catch (error) {
    console.error('Error showing notification:', error);
    
    // Fallback notification
    event.waitUntil(
      self.registration.showNotification('SoapBox Super App', {
        body: 'You have a new notification',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png'
      })
    );
  }
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = event.notification.data || {};
  let url = data.url || '/';

  // Handle action clicks
  if (event.action) {
    switch (event.action) {
      case 'open-checkin':
        url = '/weekly-checkin';
        break;
      case 'view-achievement':
        url = '/achievements';
        break;
      case 'start-reading':
        url = '/daily-bible';
        break;
      case 'open-prayers':
        url = '/prayer-wall';
        break;
      case 'view-content':
        url = data.url || '/';
        break;
      case 'remind-later':
        // Schedule a reminder for later (could be handled via API)
        return;
      case 'share-achievement':
        // Handle sharing (could open share dialog)
        url = `/achievements?share=${data.milestoneId}`;
        break;
      default:
        url = data.url || '/';
    }
  }

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Check if there's already a window/tab open
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If no existing window, open a new one
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Notification close event
self.addEventListener('notificationclose', (event) => {
  const data = event.notification.data || {};
  
  // Log notification dismissal if needed
  if (data.trackDismissal) {
    fetch('/api/notifications/dismissed', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        notificationId: data.notificationId,
        type: data.type,
        dismissedAt: new Date().toISOString()
      })
    }).catch(() => {
      // Silent error handling
    });
  }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(handleBackgroundSync());
  }
});

async function handleBackgroundSync() {
  try {
    // Handle any queued actions when back online
    const cache = await caches.open('soapbox-actions');
    const requests = await cache.keys();
    
    for (const request of requests) {
      try {
        await fetch(request);
        await cache.delete(request);
      } catch (error) {
        // Keep in cache for next sync attempt
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}
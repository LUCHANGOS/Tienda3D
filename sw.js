// Service Worker para Tienda3D - PWA
const CACHE_NAME = 'tienda3d-v1.0.0';
const API_CACHE_NAME = 'tienda3d-api-v1.0.0';

// Archivos estáticos a cachear
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/app.js',
  '/js/firebase-config.js',
  '/js/utils.js',
  '/js/theme-manager.js',
  '/js/catalog.js',
  '/js/orders.js',
  '/js/tracking.js',
  '/js/admin.js',
  '/manifest.json',
  '/favicon.ico'
];

// URLs de API y recursos externos
const API_URLS = [
  // Firebase URLs serán agregadas dinámicamente
];

// Instalar el Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cacheando archivos estáticos');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Instalación completada');
        // Forzar la activación del nuevo service worker
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Error durante la instalación:', error);
      })
  );
});

// Activar el Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activando...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Eliminar caches antiguos
            if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
              console.log('Service Worker: Eliminando cache antiguo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activado y tomando control');
        return self.clients.claim();
      })
  );
});

// Interceptar y manejar peticiones
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Estrategias de cache según el tipo de recurso
  if (isStaticAsset(request)) {
    // Cache First para archivos estáticos
    event.respondWith(cacheFirstStrategy(request));
  } else if (isAPIRequest(request)) {
    // Network First para APIs
    event.respondWith(networkFirstStrategy(request));
  } else if (isImageRequest(request)) {
    // Cache First para imágenes
    event.respondWith(cacheFirstStrategy(request));
  } else {
    // Network First por defecto
    event.respondWith(networkFirstStrategy(request));
  }
});

// Estrategia Cache First
async function cacheFirstStrategy(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('Service Worker: Sirviendo desde cache:', request.url);
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
      console.log('Service Worker: Cacheando recurso:', request.url);
    }
    return networkResponse;
  } catch (error) {
    console.error('Service Worker: Error en Cache First:', error);
    
    // Fallback para páginas HTML
    if (request.destination === 'document') {
      const fallback = await caches.match('/index.html');
      return fallback || new Response('Offline', { status: 503 });
    }
    
    return new Response('Resource not available offline', { status: 503 });
  }
}

// Estrategia Network First
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok && shouldCache(request)) {
      const cache = await caches.open(
        isAPIRequest(request) ? API_CACHE_NAME : CACHE_NAME
      );
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Red no disponible, buscando en cache:', request.url);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback para páginas HTML
    if (request.destination === 'document') {
      const fallback = await caches.match('/index.html');
      return fallback || new Response('Offline', { status: 503 });
    }
    
    return new Response('Resource not available offline', { status: 503 });
  }
}

// Verificar si es un archivo estático
function isStaticAsset(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  return pathname.endsWith('.css') ||
         pathname.endsWith('.js') ||
         pathname.endsWith('.html') ||
         pathname.endsWith('.json') ||
         pathname.endsWith('.ico') ||
         pathname === '/';
}

// Verificar si es una petición a API
function isAPIRequest(request) {
  const url = new URL(request.url);
  
  return url.hostname.includes('firebase') ||
         url.hostname.includes('googleapis') ||
         url.pathname.startsWith('/api/');
}

// Verificar si es una imagen
function isImageRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  return pathname.endsWith('.jpg') ||
         pathname.endsWith('.jpeg') ||
         pathname.endsWith('.png') ||
         pathname.endsWith('.gif') ||
         pathname.endsWith('.webp') ||
         pathname.endsWith('.svg');
}

// Verificar si debe cachearse
function shouldCache(request) {
  // No cachear peticiones POST, PUT, DELETE
  if (request.method !== 'GET') {
    return false;
  }
  
  const url = new URL(request.url);
  
  // No cachear URLs con parámetros de tiempo
  if (url.searchParams.has('t') || url.searchParams.has('timestamp')) {
    return false;
  }
  
  return true;
}

// Manejar mensajes del cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'SKIP_WAITING':
        self.skipWaiting();
        break;
      case 'CACHE_URLS':
        if (event.data.urls) {
          cacheUrls(event.data.urls);
        }
        break;
      case 'CLEAR_CACHE':
        clearAllCaches();
        break;
      case 'GET_CACHE_SIZE':
        getCacheSize().then(size => {
          event.ports[0].postMessage({ type: 'CACHE_SIZE', size });
        });
        break;
    }
  }
});

// Cachear URLs adicionales
async function cacheUrls(urls) {
  try {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(urls);
    console.log('Service Worker: URLs adicionales cacheadas');
  } catch (error) {
    console.error('Service Worker: Error cacheando URLs:', error);
  }
}

// Limpiar todos los caches
async function clearAllCaches() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    console.log('Service Worker: Todos los caches eliminados');
  } catch (error) {
    console.error('Service Worker: Error limpiando caches:', error);
  }
}

// Obtener tamaño del cache
async function getCacheSize() {
  try {
    const cacheNames = await caches.keys();
    let totalSize = 0;
    
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      
      for (const request of requests) {
        const response = await cache.match(request);
        if (response) {
          const blob = await response.blob();
          totalSize += blob.size;
        }
      }
    }
    
    return totalSize;
  } catch (error) {
    console.error('Service Worker: Error calculando tamaño del cache:', error);
    return 0;
  }
}

// Sincronización en segundo plano
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Evento de sincronización:', event.tag);
  
  switch (event.tag) {
    case 'background-sync-orders':
      event.waitUntil(syncOrders());
      break;
    case 'background-sync-user-data':
      event.waitUntil(syncUserData());
      break;
  }
});

// Sincronizar pedidos
async function syncOrders() {
  try {
    console.log('Service Worker: Sincronizando pedidos...');
    
    // Obtener datos pendientes del IndexedDB o localStorage
    const pendingOrders = await getPendingOrders();
    
    for (const order of pendingOrders) {
      try {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(order)
        });
        
        if (response.ok) {
          await removePendingOrder(order.id);
          console.log('Service Worker: Pedido sincronizado:', order.id);
        }
      } catch (error) {
        console.error('Service Worker: Error sincronizando pedido:', error);
      }
    }
  } catch (error) {
    console.error('Service Worker: Error en sincronización de pedidos:', error);
  }
}

// Sincronizar datos de usuario
async function syncUserData() {
  try {
    console.log('Service Worker: Sincronizando datos de usuario...');
    // Implementar sincronización de datos de usuario
  } catch (error) {
    console.error('Service Worker: Error en sincronización de datos:', error);
  }
}

// Obtener pedidos pendientes (simulado)
async function getPendingOrders() {
  // En una implementación real, obtendrías esto de IndexedDB
  return [];
}

// Remover pedido pendiente (simulado)
async function removePendingOrder(orderId) {
  // En una implementación real, lo removerías de IndexedDB
  console.log('Removiendo pedido pendiente:', orderId);
}

// Notificaciones Push
self.addEventListener('push', (event) => {
  console.log('Service Worker: Notificación push recibida');
  
  const options = {
    body: 'Tu pedido ha sido actualizado',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'tienda3d-notification',
    renotify: true,
    requireInteraction: false,
    actions: [
      {
        action: 'view',
        title: 'Ver Pedido',
        icon: '/icons/view-icon.png'
      },
      {
        action: 'dismiss',
        title: 'Cerrar',
        icon: '/icons/close-icon.png'
      }
    ]
  };
  
  if (event.data) {
    try {
      const data = event.data.json();
      options.body = data.body || options.body;
      options.title = data.title || 'Tienda3D';
      options.data = data;
    } catch (error) {
      console.error('Service Worker: Error parseando datos de push:', error);
    }
  }
  
  event.waitUntil(
    self.registration.showNotification('Tienda3D', options)
  );
});

// Manejar clicks en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Click en notificación:', event.action);
  
  event.notification.close();
  
  if (event.action === 'view') {
    // Abrir la aplicación en la sección de seguimiento
    event.waitUntil(
      clients.openWindow('/?section=tracking')
    );
  } else if (event.action === 'dismiss') {
    // No hacer nada, solo cerrar
    return;
  } else {
    // Click en la notificación (no en una acción)
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(clientList => {
        // Si ya hay una ventana abierta, enfocarla
        for (const client of clientList) {
          if (client.url.includes('/') && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Si no hay ventana abierta, abrir una nueva
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});

// Manejar cierre de notificaciones
self.addEventListener('notificationclose', (event) => {
  console.log('Service Worker: Notificación cerrada:', event.notification.tag);
  
  // Analíticas o limpieza si es necesario
});

// Manejo de errores global
self.addEventListener('error', (event) => {
  console.error('Service Worker: Error global:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker: Promise rechazada no manejada:', event.reason);
});

// Logging y debugging
function log(message, data = null) {
  console.log(`[SW] ${new Date().toISOString()}: ${message}`, data || '');
}

// Información del Service Worker
console.log('Service Worker Tienda3D cargado - Versión:', CACHE_NAME);

// Service Worker для KosmoKorn PWA
const CACHE_NAME = "kosmokorn-v1.0.0"
const CACHE_PREFIX = "kosmokorn-"

// Ресурсы для кеширования
const STATIC_CACHE_URLS = [
  "/",
  "/index.html",
  "/src/main.tsx",
  "/src/App.tsx",
  "/src/index.css",
  "/manifest.json"
]

// Установка Service Worker
self.addEventListener("install", (event) => {
  console.log("Service Worker: Установка")

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Service Worker: Кеширование статических ресурсов")
        return cache.addAll(STATIC_CACHE_URLS)
      })
      .catch((error) => {
        console.error("Service Worker: Ошибка кеширования", error)
      })
  )

  // Принудительно активируем новый SW
  self.skipWaiting()
})

// Активация Service Worker
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Активация")

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            // Удаляем старые кеши
            return cacheName.startsWith(CACHE_PREFIX) && cacheName !== CACHE_NAME
          })
          .map((cacheName) => {
            console.log("Service Worker: Удаление старого кеша", cacheName)
            return caches.delete(cacheName)
          })
      )
    })
  )

  // Захватываем управление всеми клиентами
  self.clients.claim()
})

// Обработка fetch запросов
self.addEventListener("fetch", (event) => {
  const { request } = event

  // Игнорируем запросы chrome-extension и другие схемы
  if (!request.url.startsWith("http")) {
    return
  }

  // Стратегия кеширования: Cache First для статических ресурсов
  if (isStaticResource(request.url)) {
    event.respondWith(
      caches
        .match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse
          }

          return fetch(request).then((response) => {
            // Клонируем ответ для кеширования
            const responseToCache = response.clone()

            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache)
            })

            return response
          })
        })
        .catch(() => {
          // Возвращаем оффлайн страницу для HTML запросов
          if (request.headers.get("accept").includes("text/html")) {
            return caches.match("/index.html")
          }
        })
    )
  }
  // Стратегия Network First для API и динамических запросов
  else {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Кешируем успешные ответы
          if (response.status === 200) {
            const responseToCache = response.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache)
            })
          }
          return response
        })
        .catch(() => {
          // Если сеть недоступна, пытаемся получить из кеша
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse
            }
            // Возвращаем fallback для HTML запросов
            if (request.headers.get("accept").includes("text/html")) {
              return caches.match("/index.html")
            }
          })
        })
    )
  }
})

// Обработка сообщений от клиента
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }

  if (event.data && event.data.type === "GET_CACHE_SIZE") {
    getCacheSize().then((size) => {
      event.ports[0].postMessage({ cacheSize: size })
    })
  }
})

// Обработка фоновой синхронизации
self.addEventListener("sync", (event) => {
  if (event.tag === "planet-sync") {
    console.log("Service Worker: Фоновая синхронизация планеты")
    event.waitUntil(syncPlanetData())
  }
})

// Обработка push уведомлений
self.addEventListener("push", (event) => {
  const options = {
    body: event.data ? event.data.text() : "Ваша планета ждет вас!",
    icon: "/pwa-192x192.png",
    badge: "/pwa-192x192.png",
    vibrate: [200, 100, 200],
    tag: "kosmokorn-notification",
    actions: [
      {
        action: "open",
        title: "Открыть планету",
        icon: "/pwa-192x192.png"
      },
      {
        action: "close",
        title: "Позже"
      }
    ]
  }

  event.waitUntil(self.registration.showNotification("KosmoKorn", options))
})

// Обработка кликов по уведомлениям
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  if (event.action === "open" || !event.action) {
    event.waitUntil(clients.openWindow("/"))
  }
})

// Вспомогательные функции

/**
 * Проверяет, является ли ресурс статическим
 */
function isStaticResource(url) {
  const staticExtensions = [
    ".js",
    ".css",
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".svg",
    ".woff",
    ".woff2",
    ".ttf"
  ]
  const pathname = new URL(url).pathname
  return (
    staticExtensions.some((ext) => pathname.endsWith(ext)) ||
    pathname === "/" ||
    pathname === "/index.html"
  )
}

/**
 * Рассчитывает размер кеша
 */
async function getCacheSize() {
  try {
    const cacheNames = await caches.keys()
    let totalSize = 0

    for (const cacheName of cacheNames) {
      if (cacheName.startsWith(CACHE_PREFIX)) {
        const cache = await caches.open(cacheName)
        const keys = await cache.keys()

        for (const key of keys) {
          const response = await cache.match(key)
          if (response) {
            const blob = await response.blob()
            totalSize += blob.size
          }
        }
      }
    }

    return totalSize
  } catch (error) {
    console.error("Ошибка расчета размера кеша:", error)
    return 0
  }
}

/**
 * Синхронизация данных планеты
 */
async function syncPlanetData() {
  try {
    // Здесь можно добавить логику синхронизации с сервером
    console.log("Синхронизация данных планеты...")

    // Пример: проверяем localStorage на наличие несинхронизированных данных
    const clients = await self.clients.matchAll()
    clients.forEach((client) => {
      client.postMessage({
        type: "SYNC_COMPLETE",
        message: "Данные планеты синхронизированы"
      })
    })
  } catch (error) {
    console.error("Ошибка синхронизации:", error)
  }
}

console.log("Service Worker: Загружен и готов к работе")

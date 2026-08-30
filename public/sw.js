// Service worker mínimo — apenas para habilitar a instalação (PWA).
// Não faz cache de dados da API para evitar exibir informações desatualizadas.

self.addEventListener("install", () => {
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return
  event.respondWith(fetch(event.request))
})

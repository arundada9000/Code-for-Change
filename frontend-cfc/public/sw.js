// Service Worker for Push Notifications
self.addEventListener("push", function (event) {
  if (event.data) {
    try {
      const data = event.data.json();
      
      const options = {
        body: data.body,
        icon: data.icon || "/icons/icon-192x192.png",
        badge: "/icons/icon-72x72.png",
        data: data.data || {},
        vibrate: [100, 50, 100],
        requireInteraction: false
      };

      event.waitUntil(self.registration.showNotification(data.title, options));
    } catch (e) {
      console.error("Error parsing push notification data:", e);
      // Fallback for non-JSON payloads
      event.waitUntil(
        self.registration.showNotification("New Notification", {
          body: event.data.text(),
          icon: "/icons/icon-192x192.png",
        })
      );
    }
  }
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  const urlToOpen = event.notification.data.url || "/";

  // This looks to see if the current is already open and
  // focuses if it is
  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then(function (clientList) {
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes(urlToOpen) && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

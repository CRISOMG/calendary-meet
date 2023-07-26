/**
 * checks if Push notification and service workers are supported by your browser
 */
function isPushNotificationSupported() {
  return "serviceWorker" in navigator && "PushManager" in window;
}

/**
 * asks user consent to receive push notifications and returns the response of the user, one of granted, default, denied
 */
function initializePushNotifications() {
  // request user grant to show notification
  return Notification.requestPermission(function (result) {
    return result;
  });
}
/**
 * shows a notification
 */
function sendNotification() {
  const title = "Calendary Meet";
  const options = {
    body: "Tienes un nuevo Meet programado!",
    icon: "/calendary-icon.png",
    vibrate: [200, 100, 200],
    tag: "new-meet",
    image: "/calendar-icon.png",
    badge: "https://localhost:3000/calendar-icon",
    actions: [
      {
        action: "Detail",
        title: "Ver",
        icon: "https://localhost:3000/",
      },
    ],
  };
  navigator.serviceWorker.ready.then(function (serviceWorker) {
    serviceWorker.showNotification(title, options);
  });
}

/**
 *
 */
function registerServiceWorker() {
  navigator.serviceWorker.register("/sw.js").then(function (swRegistration) {
    //you can do something with the service wrker registration (swRegistration)
  });
}

const pushNotificationSuported = isPushNotificationSupported();

if (pushNotificationSuported) {
  registerServiceWorker();
  initializePushNotifications().then(function (consent) {
    if (consent === "granted") {
      sendNotification();
    }
  });
}

function receivePushNotification(event) {
  console.log("[Service Worker] Push Received.");

  //const { image, tag, url, title, text } = event.data.json();
  const notificationText = event.data.text();
  //call the method showNotification to show the notification
  const calendarIconUrl = "http://localhost:3000/calendar-icon.png";
  event.waitUntil(
    self.registration.showNotification("Calendary Meet", {
      body: "Tienes un nuevo Meet programado!",
      icon: calendarIconUrl,
      vibrate: [200, 100, 200],
      tag: "new-meet",
      image: calendarIconUrl,
      badge: calendarIconUrl,
      actions: [
        {
          action: "Detail",
          title: "Ver",
          icon: calendarIconUrl,
        },
      ],
    })
  );
}
self.addEventListener("push", receivePushNotification);

function openPushNotification(event) {
  console.log(
    "[Service Worker] Notification click Received.",
    event.notification.data
  );

  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data));
}

self.addEventListener("notificationclick", openPushNotification);

self.addEventListener("install", function (event) {
  console.log("Hello world from the Service Worker 🤙");
});

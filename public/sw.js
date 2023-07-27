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
// function sendNotification() {
//   const title = "Calendary Meet";
//   const options = {
//     body: "Tienes un nuevo Meet programado!",
//     icon: "/calendary-icon.png",
//     vibrate: [200, 100, 200],
//     tag: "new-meet",
//     image: "/calendar-icon.png",
//     badge: "https://localhost:3000/calendar-icon",
//     actions: [
//       {
//         action: "Detail",
//         title: "Ver",
//         icon: "https://localhost:3000/",
//       },
//     ],
//   };
//   navigator.serviceWorker.ready.then(function (serviceWorker) {
//     serviceWorker.showNotification(title, options);
//   });
// }

/**
 *
 */
function registerServiceWorker() {
  navigator.serviceWorker.register("/sw.js").then(function (swRegistration) {
    //you can do something with the service wrker registration (swRegistration)
  });
}

// const pushNotificationSuported = isPushNotificationSupported();

// if (pushNotificationSuported) {
//   registerServiceWorker();
//   initializePushNotifications().then(function (consent) {
//     if (consent === "granted") {
//       sendNotification();
//     }
//   });
// }

function receivePushNotification(event) {
  const { type } = event.data.json();
  console.log("[Service Worker] Push Received. type: ", type);
  // const notificationText = event.data.text();
  //call the method showNotification to show the notification

  const calendarIconUrl = "http://localhost:3000/calendar-icon.png";
  if (type === "remember") {
    event.waitUntil(
      self.registration.showNotification("Calendary Meet Remember", {
        body: "Recuerda que tienes un cita programada.",
        icon: calendarIconUrl,
        vibrate: [200, 100, 200],
        tag: "remember",
        image: calendarIconUrl,
        badge: calendarIconUrl,
        // actions: [
        //   {
        //     action: "Detail",
        //     title: "Ver",
        //     icon: calendarIconUrl,
        //   },
        // ],
      })
    );
  }

  if (type === "new-suscription") {
    event.waitUntil(
      self.registration.showNotification("Calendary Meet Notifications", {
        body: "Notificaciones Activas.",
        icon: calendarIconUrl,
        vibrate: [200, 100, 200],
        tag: "active-notifications",
        image: calendarIconUrl,
        badge: calendarIconUrl,
        // actions: [
        //   {
        //     action: "Detail",
        //     title: "Ver",
        //     icon: calendarIconUrl,
        //   },
        // ],
      })
    );
  }
  if (type === "test-suscription") {
    event.waitUntil(
      self.registration.showNotification("Calendary Meet Notifications", {
        body: "Notificaciones Activas.",
        icon: calendarIconUrl,
        vibrate: [200, 100, 200],
        tag: "active-notifications",
        image: calendarIconUrl,
        badge: calendarIconUrl,
        // actions: [
        //   {
        //     action: "Detail",
        //     title: "Ver",
        //     icon: calendarIconUrl,
        //   },
        // ],
      })
    );
  }
}
self.addEventListener("push", receivePushNotification);

function openPushNotification(event) {
  console.log(
    "[Service Worker] Notification click Received.",
    event.notification.data
  );

  event.notification.close();
  event.waitUntil(clients.openWindow());
}

self.addEventListener("notificationclick", openPushNotification);

self.addEventListener("install", function (event) {
  initializePushNotifications();
  console.log("[Service Worker] installed 🤙");
});

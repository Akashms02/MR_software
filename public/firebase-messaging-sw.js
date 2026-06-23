// Import and configure the Firebase SDK
// These scripts are made available by the Firebase CDN
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyABlVbGe9JckJO241XR6opSBM9hTrCDBsE",
  authDomain: "medistrax.firebaseapp.com",
  projectId: "medistrax",
  storageBucket: "medistrax.firebasestorage.app",
  messagingSenderId: "487678988985",
  appId: "1:487678988985:web:cc3f8bb1daa9fa7b464168",
  measurementId: "G-R1FGD9D6DE"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification?.title || "Medistrax Alert";
  const notificationOptions = {
    body: payload.notification?.body || "",
    icon: '/favicon.svg',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click and redirect/focus client tab
self.addEventListener('notificationclick', (event) => {
  event.notification.close(); // Close the notification banner

  const data = event.notification.data || {};
  let targetUrl = '/'; // Defaults to root, which auto-redirects authenticated sessions to their dashboard

  if (data.click_action || data.url) {
    targetUrl = data.click_action || data.url;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a tab is already open, focus it and redirect
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // If no tab is open, open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

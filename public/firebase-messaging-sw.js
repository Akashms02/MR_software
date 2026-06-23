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

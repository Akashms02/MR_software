import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import axios from "../api/axiosInstance";
import { API_ROUTE } from "../data/env";

const firebaseConfig = {
  apiKey: "AIzaSyABlVbGe9JckJO241XR6opSBM9hTrCDBsE",
  authDomain: "medistrax.firebaseapp.com",
  projectId: "medistrax",
  storageBucket: "medistrax.firebasestorage.app",
  messagingSenderId: "487678988985",
  appId: "1:487678988985:web:cc3f8bb1daa9fa7b464168",
  measurementId: "G-R1FGD9D6DE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

// Request Permission and Register Token
export const requestForToken = async () => {
  if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator)) {
    console.log('[FCM] Push notifications are not supported in this browser environment.');
    return;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      // Explicitly register the service worker from the root public directory
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('[FCM] Service Worker registered with scope:', registration.scope);

      const currentToken = await getToken(messaging, {
        vapidKey: 'BKrleol3WW_on23A3bEH2zsXGQ9iW-sup_8Sg6cIx6NSJLmgvvQiTc4orasn4RWl5DMBxq0jqgoxRoO18hhQAaE',
        serviceWorkerRegistration: registration
      });
      if (currentToken) {
        console.log('[FCM] Token obtained successfully:', currentToken);
        // Send token to backend using our custom axios instance (which has auth interceptors)
        const response = await axios.post(`${API_ROUTE}/push-tokens/register`, { token: currentToken });
        console.log('[FCM] Token registered on backend successfully:', response.data);
      } else {
        console.log('[FCM] No registration token available.');
      }
    } else {
      console.warn('[FCM] Notification permission was denied.');
    }
  } catch (err) {
    console.error('[FCM] An error occurred while retrieving token:', err);
  }
};

// Listen for foreground messages
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('[FCM] Message received in foreground:', payload);
      resolve(payload);
    });
  });

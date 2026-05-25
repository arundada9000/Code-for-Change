import API from "../Services/api";

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Registers the Service Worker.
 * Called automatically when the app loads.
 */
export async function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });
      return registration;
    } catch (error) {
      console.error("Service Worker registration failed:", error);
      return null;
    }
  }
  return null;
}

/**
 * Requests notification permission, subscribes the device, and sends the subscription to the backend.
 * Called when the user toggles "Enable Notifications" in settings.
 */
export async function subscribeUserToPush(vapidPublicKey) {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    throw new Error("Push notifications are not supported in this browser.");
  }

  // Ask for permission
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Notification permission denied");
  }

  const registration = await navigator.serviceWorker.ready;

  // Check for existing subscription
  const existingSubscription = await registration.pushManager.getSubscription();
  if (existingSubscription) {
    // If we already have a subscription, just ensure the backend knows about it
    await API.post("/notifications/subscribe", {
      subscription: existingSubscription,
    });
    return existingSubscription;
  }

  // Create new subscription
  const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey,
  });

  // Send to backend
  await API.post("/notifications/subscribe", {
    subscription,
  });

  return subscription;
}

/**
 * Unsubscribes the current device and removes the subscription from the backend.
 */
export async function unsubscribeUserFromPush() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return;
  }

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  
  if (subscription) {
    const endpoint = subscription.endpoint;
    
    // Tell backend to remove it first
    try {
      await API.post("/notifications/unsubscribe", { endpoint });
    } catch (e) {
      console.error("Failed to notify backend of unsubscription", e);
    }
    
    // Then unsubscribe in browser
    await subscription.unsubscribe();
  }
}

/**
 * Check if the user is currently subscribed
 */
export async function isPushSubscribed() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return false;
  }

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  return !!subscription;
}


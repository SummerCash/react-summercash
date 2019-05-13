import * as firebase from "firebase/app"; // Import firebase
import "firebase/messaging"; // Import firebase messaging

const initializedApp = firebase.initializeApp({
  messagingSenderId: "1059498544595"
}); // Initialize app

const messaging = initializedApp.messaging(); // Get messaging

messaging.usePublicVapidKey(
  "BC4ZqPJCqZhv1LpaC4iDYMldku5h6JsfvYf4IQyAufOQ53ODDQB8Fg06zAaC5z6UThSgXYgmw6i2jpxM9_AmfJ0"
); // Set vapid push key

export { messaging }; // Export

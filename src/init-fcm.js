import * as firebase from "firebase/app"; // Import firebase
import "firebase/messaging"; // Import firebase messaging

const initializedApp = firebase.initializeApp({
  apiKey: "AIzaSyA0XqseFmaRijRIRmqogPl2jrf7FyuRyeo",
  authDomain: "summercash-wallet.firebaseapp.com",
  databaseURL: "https://summercash-wallet.firebaseio.com",
  projectId: "summercash-wallet",
  storageBucket: "summercash-wallet.appspot.com",
  messagingSenderId: "1059498544595"
}); // Initialize app

let messaging = null; // Initialize messaging buffer

if (initializedApp.messaging.isSupported()) {
  // Check has messaging support
  messaging = initializedApp.messaging(); // Get messaging

  messaging.usePublicVapidKey(
    "BC4ZqPJCqZhv1LpaC4iDYMldku5h6JsfvYf4IQyAufOQ53ODDQB8Fg06zAaC5z6UThSgXYgmw6i2jpxM9_AmfJ0"
  ); // Set vapid push key
}

export { messaging }; // Export

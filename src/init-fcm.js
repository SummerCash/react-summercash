import * as firebase from "firebase/app"; // Import firebase
import "firebase/messaging"; // Import firebase messaging

const initializedApp = firebase.initializeApp({
  apiKey: "AIzaSyA0XqseFmaRijRIRmqogPl2jrf7FyuRyeo",
  authDomain: "summercash-wallet.firebaseapp.com",
  databaseURL: "https://summercash-wallet.firebaseio.com",
  projectId: "summercash-wallet",
  storageBucket: "summercash-wallet.appspot.com",
  messagingSenderId: "1059498544595",
  appId: "1:1059498544595:web:44560a2db9a9c19c"
}); // Initialize app

const messaging = initializedApp.messaging(); // Get messaging

messaging.usePublicVapidKey(
  "BC4ZqPJCqZhv1LpaC4iDYMldku5h6JsfvYf4IQyAufOQ53ODDQB8Fg06zAaC5z6UThSgXYgmw6i2jpxM9_AmfJ0"
); // Set vapid push key

export { messaging }; // Export

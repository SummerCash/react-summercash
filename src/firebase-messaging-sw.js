importScripts("https://www.gstatic.com/firebasejs/4.8.1/firebase-app.js"); // Import firebase
importScripts("https://www.gstatic.com/firebasejs/4.8.1/firebase-messaging.js"); // Import firebase

const config = {
  apiKey: "AIzaSyA0XqseFmaRijRIRmqogPl2jrf7FyuRyeo",
  authDomain: "summercash-wallet.firebaseapp.com",
  databaseURL: "https://summercash-wallet.firebaseio.com",
  projectId: "summercash-wallet",
  storageBucket: "summercash-wallet.appspot.com",
  messagingSenderId: "1059498544595",
  appId: "1:1059498544595:web:44560a2db9a9c19c"
}; // Set config

firebase.initializeApp(config); // Initialize app

const messaging = firebase.messaging(); // Get messaging

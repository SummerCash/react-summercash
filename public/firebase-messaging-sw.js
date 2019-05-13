importScripts("https://www.gstatic.com/firebasejs/5.9.4/firebase-app.js"); // Import firebase
importScripts("https://www.gstatic.com/firebasejs/5.9.4/firebase-messaging.js"); // Import firebase

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

messaging.setBackgroundMessageHandler(payload => {
  const promiseChain = clients
    .matchAll({
      type: "window",
      includeUncontrolled: true
    })
    .then(windowClients => {
      for (let i = 0; i < windowClients.length; i++) {
        // Iterate through window clients
        const windowClient = windowClients[i]; // Get current window client

        windowClient.postMessage(payload); // Post message payload
      }
    })
    .then(() => {
      return registration.showNotification("New Transaction", {
        body: payload
      }); // Show notification
    });

  return promiseChain; // Return promise chain
});

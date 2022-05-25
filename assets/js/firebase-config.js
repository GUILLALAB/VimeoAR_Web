/**
 * To find your Firebase config object:
 * 
 * 1. Go to your [Project settings in the Firebase console](https://console.firebase.google.com/project/_/settings/general/)
 * 2. In the "Your apps" card, select the nickname of the app for which you need a config object.
 * 3. Select Config from the Firebase SDK snippet pane.
 * 4. Copy the config object snippet, then add it here.
 */


const config = {
  apiKey: "AIzaSyDZxkhxMAtsDsbA8_55VP-b7ELP5bnq0WE",
  authDomain: "friendlychat-e079a.firebaseapp.com",
  projectId: "friendlychat-e079a",
  storageBucket: "friendlychat-e079a.appspot.com",
  messagingSenderId: "963253907353",
  appId: "1:963253907353:web:b052c5c620d782b8a92d08"
};

export function getFirebaseConfig() {
  if (!config || !config.apiKey) {
    throw new Error('No Firebase configuration object provided.' + '\n' +
    'Add your web app\'s configuration object to firebase-config.js');
  } else {
    return config;
  }
}
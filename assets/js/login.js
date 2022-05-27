/**
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 'use strict';

 import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js";
import { getFirestore,
  collection,
  addDoc,
  query,
  getDocs,
  orderBy,
  limit,
  onSnapshot,
  setDoc,
  where,
  updateDoc,
  doc,
  Timestamp,
  serverTimestamp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js"
import { getAuth,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,createUserWithEmailAndPassword,
  signOut } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-auth.js"

 import {
   getStorage,
   ref,
   uploadBytesResumable,
   getDownloadURL
 } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-storage.js"
 import {
   getMessaging,
   getToken,
   onMessage
 }  from "https://www.gstatic.com/firebasejs/9.1.1/firebase-messaging.js"
 import { getPerformance } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-performance.js"

 import { getFirebaseConfig } from './firebase-config.js';
 
  function SignEmail(){
  const auth = getAuth();
  var username = document.getElementById("username").value;
  var password = document.getElementById("password").value;

  createUserWithEmailAndPassword(auth, username, password)
    .then((userCredential) => {
      // Signed in 
      
      const user = userCredential.user;
      window.location = "https://livear.herokuapp.com/";

      // ...
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      // ..
    });

    
 }

  function SignInEmail(){
    var email = document.getElementById("username").value;
    var password = document.getElementById("password").value;
  
  signInWithEmailAndPassword(getAuth(), email, password)
    .then((userCredential) => {
      // Signed in 
      const user = userCredential.user;
      // ...
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
    });
 }
 // Signs-in Friendly Chat.
 async function signIn() {
   // Sign in Firebase using popup auth and Google as the identity provider.
   var provider = new GoogleAuthProvider();
   await signInWithPopup(getAuth(), provider);
 }
 
 // Signs-out of Friendly Chat.
 function signOutUser() {
   // Sign out of Firebase.
   signOut(getAuth());
 }
 
 // Initialize firebase auth
 function initFirebaseAuth() {
   // Listen to auth state changes.
   onAuthStateChanged(getAuth(), authStateObserver);
 }
 
 // Returns the signed-in user's profile Pic URL.
 function getProfilePicUrl() {
   return getAuth().currentUser.photoURL || '/images/profile_placeholder.png';
 }
 
 // Returns the signed-in user's display name.
 function getUserName() {
   return getAuth().currentUser.displayName;
 }
 
 // Returns true if a user is signed-in.
 function isUserSignedIn() {
   return !!getAuth().currentUser;
 }
 


 

 
 // Requests permissions to show notifications.
 async function requestNotificationsPermissions() {
   console.log('Requesting notifications permission...');
   const permission = await Notification.requestPermission();
   
   if (permission === 'granted') {
     console.log('Notification permission granted.');
     // Notification permission granted.
     await saveMessagingDeviceToken();
   } else {
     console.log('Unable to get permission to notify.');
   }
 }
 
 
 
 
 // Triggers when the auth state change for instance when the user signs-in or signs-out.
 function authStateObserver(user) {
   if (user) { // User is signed in!
     // Hide sign-in button.
     signInButtonElement.setAttribute('hidden', 'true');
     window.location = "https://livear.herokuapp.com/";
     // We save the Firebase Messaging Device token and enable notifications.
   } else { // User is signed out!
     // Hide user's profile and sign-out button.
 
     // Show sign-in button.
     signInButtonElement.removeAttribute('hidden');
   }
 }
 
 


 
 // Displays a Message in the UI.

 
 // Enables or disables the submit button depending on the values of the input
 // fields.

 
 // Shortcuts to DOM Elements.
 var signInButtonElement = document.getElementById('sign-in');
 var sign = document.getElementById('sign');

 // Saves message on form submit.
 signInButtonElement.addEventListener('click', signIn);
 sign.addEventListener('click', SignEmail);

 // Toggle for the button.
 


const firebaseApp = initializeApp(getFirebaseConfig());
getPerformance();
initFirebaseAuth();
 
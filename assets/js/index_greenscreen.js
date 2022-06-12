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
  deleteDoc,
  doc,
  Timestamp,
  serverTimestamp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js"
import { getAuth,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
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
 
  var docRefId=null;
  var minputValue="";
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
   window.location = "https://livear.herokuapp.com/login";
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
 function getUserUid() {
  return getAuth().currentUser.uid;
}
 // Returns true if a user is signed-in.
 function isUserSignedIn() {
   return !!getAuth().currentUser;
 }
 

 export async function LoadBroadcast(){
  var listElm = document.querySelector('#infinite-list');

  const recentMessagesQuery = query(collection(getFirestore(), 'Broadcast'), orderBy('timestamp', 'desc'), limit(12));
  var nextItem = 1;

  // Start listening to the query.
  onSnapshot(recentMessagesQuery, function(snapshot) {
    snapshot.docChanges().forEach(function(change) {
      var item = document.createElement('li');
      item.addEventListener('click', myFunc, false);
      item.myParam = change.doc.data().chan;

      item.innerText = change.doc.data().chan + change.doc.data().name;
      listElm.appendChild(item);
      
      console.log('BIP LoadBroadcast', change.doc.id);
    });
  });

  
 /* listElm.addEventListener('scroll', function() {
    if (listElm.scrollTop + listElm.clientHeight >= listElm.scrollHeight) {
      LoadBroadcast();
    }
  });
  
  LoadBroadcast();*/
 }

 export function myFunc(evt)
 {
   document.getElementById("myInput").value= evt.currentTarget.myParam;
   minputValue=evt.currentTarget.myParam;
   var event = new CustomEvent("buttonclick", { "detail": evt.currentTarget.myParam});
   document.dispatchEvent(event);
 }
 
 export function inputValue(){
   return minputValue;
 }
 
 export async function UserStopBroadcast(){
   
   if(docRefId!=null){
    await deleteDoc(doc(getFirestore(), "Broadcast", docRefId));
 // await deleteDoc(doc(getFirestore(), "Broadcast", docRefId));
}
 }
 export async function UserStartBroadcast(channelName) {
  // Add a new message entry to the Firebase database.
  try {
  const docRef = await addDoc(collection(getFirestore(), "Broadcast"), {
    name: getUserName(),
    text: getUserUid(),
    chan:channelName,
    profilePicUrl: getProfilePicUrl(),
    timestamp: serverTimestamp()
  });
  console.log("Document written with ID: ", docRef.id);
  docRefId=docRef.id;
  }


  /*  await addDoc(collection(getFirestore(), 'Broadcast'), {
      name: getUserName(),
      text: getUserUid(),
      chan:channelName,
      profilePicUrl: getProfilePicUrl(),
      timestamp: serverTimestamp()
    });*/
  
  catch(error) {
    console.error('Error writing new message to Firebase Database', error);
  }
}
 
 // Loads chat messages history and listens for upcoming ones.
 export function loadMessages() {
   // Create the query to load the last 12 messages and listen for new ones.
   const recentMessagesQuery = query(collection(getFirestore(), 'Broadcast'), orderBy('timestamp', 'desc'), limit(12));
   
   // Start listening to the query.
   onSnapshot(recentMessagesQuery, function(snapshot) {
     snapshot.docChanges().forEach(function(change) {
       if (change.type === 'removed') {
         deleteMessage(change.doc.id);
       } else {
         var message = change.doc.data();
         displayMessage(change.doc.id, message.timestamp, message.name,
                       message.chan, message.profilePicUrl);
       }
     });
   });
 }
 
 // Saves a new message containing an image in Firebase.
 // This first saves the image in Firebase storage.
 async function saveImageMessage(file) {
   try {
     // 1 - We add a message with a loading icon that will get updated with the shared image.
     const messageRef = await addDoc(collection(getFirestore(), 'messages'), {
       name: getUserName(),
       imageUrl: LOADING_IMAGE_URL,
       profilePicUrl: getProfilePicUrl(),
       timestamp: serverTimestamp()
     });
 
     // 2 - Upload the image to Cloud Storage.
     const filePath = `${getAuth().currentUser.uid}/${messageRef.id}/${file.name}`;
     const newImageRef = ref(getStorage(), filePath);
     const fileSnapshot = await uploadBytesResumable(newImageRef, file);
     
     // 3 - Generate a public URL for the file.
     const publicImageUrl = await getDownloadURL(newImageRef);
 
     // 4 - Update the chat message placeholder with the image’s URL.
     await updateDoc(messageRef,{
       imageUrl: publicImageUrl,
       storageUri: fileSnapshot.metadata.fullPath
     });
   } catch (error) {
     console.error('There was an error uploading a file to Cloud Storage:', error);
   }
 }
 
 // Saves the messaging device token to Cloud Firestore.
 async function saveMessagingDeviceToken() {
   try {
     const currentToken = await getToken(getMessaging());
     if (currentToken) {
       console.log('Got FCM device token:', currentToken);
       // Saving the Device Token to Cloud Firestore.
       const tokenRef = doc(getFirestore(), 'fcmTokens', currentToken);
       await setDoc(tokenRef, { uid: getAuth().currentUser.uid });

       // This will fire when a message is received while the app is in the foreground.
       // When the app is in the background, firebase-messaging-sw.js will receive the message instead.
       onMessage(getMessaging(), (message) => {
         console.log(
           'New foreground notification from Firebase Messaging!',
           message.notification
         );
       });
     } else {
       // Need to request permissions to show notifications.
       requestNotificationsPermissions();
     }
   } catch(error) {
     console.error('Unable to get messaging token.', error);
   };
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
     // Get the signed-in user's profile pic and name.
     var profilePicUrl = getProfilePicUrl();
     var userName = getUserName();
 
     // Set the user's profile pic and name.
     userPicElement.style.backgroundImage = 'url(' + addSizeToGoogleProfilePic(profilePicUrl) + ')';
     userNameElement.textContent = userName;
 
     // Show user's profile and sign-out button.
     userNameElement.removeAttribute('hidden');
     userPicElement.removeAttribute('hidden');
     signOutButtonElement.removeAttribute('hidden');
 
     // Hide sign-in button.
     signInButtonElement.setAttribute('hidden', 'true');
 
     // We save the Firebase Messaging Device token and enable notifications.
     saveMessagingDeviceToken();
   } else { // User is signed out!
     // Hide user's profile and sign-out button.

     userNameElement.setAttribute('hidden', 'true');
     userPicElement.setAttribute('hidden', 'true');
     signOutButtonElement.setAttribute('hidden', 'true');
 
     // Show sign-in button.
     signInButtonElement.removeAttribute('hidden');
   }
 }
 
 // Returns true if user is signed-in. Otherwise false and displays a message.
 function checkSignedInWithMessage() {
   // Return true if the user is signed in Firebase
   if (isUserSignedIn()) {
     return true;
   }
 
   // Display a message to the user using a Toast.
   var data = {
     message: 'You must sign-in first',
     timeout: 2000
   };
   signInSnackbarElement.MaterialSnackbar.showSnackbar(data);
   return false;
 }
 
 // Resets the given MaterialTextField.
 function resetMaterialTextfield(element) {
   element.value = '';
   element.parentNode.MaterialTextfield.boundUpdateClassesHandler();
 }
 
 // Template for messages.
 var MESSAGE_TEMPLATE =
     '<div class="message-container">' +
       '<div class="spacing"><div class="pic"></div></div>' +
       '<div class="message"></div>' +
       '<div class="name"></div>' +
       '<button class="button"></button>' +
     '</div>';
 
 // Adds a size to Google Profile pics URLs.
 function addSizeToGoogleProfilePic(url) {
   if (url.indexOf('googleusercontent.com') !== -1 && url.indexOf('?') === -1) {
     return url + '?sz=150';
   }
   return url;
 }
 
 // A loading image URL.
 var LOADING_IMAGE_URL = 'https://www.google.com/images/spin-32.gif?a';
 
 // Delete a Message from the UI.
 function deleteMessage(id) {
   var div = document.getElementById(id);
   // If an element for that message exists we delete it.
   if (div) {
     div.parentNode.removeChild(div);
   }
 }
 
 function createAndInsertMessage(id, timestamp) {
   const container = document.createElement('div');
   container.innerHTML = MESSAGE_TEMPLATE;
   const div = container.firstChild;
   div.setAttribute('id', id);
 
   // If timestamp is null, assume we've gotten a brand new message.
   // https://stackoverflow.com/a/47781432/4816918
   timestamp = timestamp ? timestamp.toMillis() : Date.now();
   div.setAttribute('timestamp', timestamp);
 
   // figure out where to insert new message
   const existingMessages = messageListElement.children;
   if (existingMessages.length === 0) {
     messageListElement.appendChild(div);
   } else {
     let messageListNode = existingMessages[0];
 
     while (messageListNode) {
       const messageListNodeTime = messageListNode.getAttribute('timestamp');
 
       if (!messageListNodeTime) {
         throw new Error(
           `Child ${messageListNode.id} has no 'timestamp' attribute`
         );
       }
 
       if (messageListNodeTime > timestamp) {
         break;
       }
 
       messageListNode = messageListNode.nextSibling;
     }
 
     messageListElement.insertBefore(div, messageListNode);
   }
 
   return div;
 }
 
 // Displays a Message in the UI.
 function displayMessage(id, timestamp, name, text, picUrl) {
   var div = document.getElementById(id) || createAndInsertMessage(id, timestamp);
 
   // profile picture
   if (picUrl) {
     div.querySelector('.pic').style.backgroundImage = 'url(' + addSizeToGoogleProfilePic(picUrl) + ')';
   }
 
   div.querySelector('.name').textContent = text;
   div.querySelector('.button').textContent = text;
   var btnElement = div.querySelector('.button');
   btnElement.myParam = text;
   btnElement.addEventListener('click', myFunc, false);

   var messageElement = div.querySelector('.message');
 
   if (text) { // If the message is text.
     messageElement.textContent = name;
     messageElement.myParam = text;
     messageElement.addEventListener('click', myFunc, false);

     // Replace all line breaks by <br>.
     messageElement.innerHTML = messageElement.innerHTML.replace(/\n/g, '<br>');
   } 
   // Show the card fading-in and scroll to view the new message.
   setTimeout(function() {div.classList.add('visible')}, 1);
   messageListElement.scrollTop = messageListElement.scrollHeight;
 }
 
 // Enables or disables the submit button depending on the values of the input
 // fields.

 
 // Shortcuts to DOM Elements.
 var messageListElement = document.getElementById('messages');
 var userPicElement = document.getElementById('user-pic');
 var userNameElement = document.getElementById('user-name');
 var signInButtonElement = document.getElementById('sign-in');
 var signOutButtonElement = document.getElementById('sign-out');
 var signInSnackbarElement = document.getElementById('must-signin-snackbar');
 
 // Saves message on form submit.
 signOutButtonElement.addEventListener('click', signOutUser);
 signInButtonElement.addEventListener('click', signIn);

 

const firebaseApp = initializeApp(getFirebaseConfig());
getPerformance();
initFirebaseAuth();

// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyC7vSR3vElCmkiiMgdJEv-cPS0TEKJwrDY',
  authDomain: 'stand-up-duck.firebaseapp.com',
  databaseURL: 'https://stand-up-duck-default-rtdb.firebaseio.com',
  projectId: 'stand-up-duck',
  storageBucket: 'stand-up-duck.appspot.com',
  messagingSenderId: '428802696640',
  appId: '1:428802696640:web:c0fae1651ec9724e16d425',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);
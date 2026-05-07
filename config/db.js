const firebase = require('firebase/compat/app');
require('firebase/compat/firestore');
require('dotenv').config();

const firebaseConfig = {
  apiKey: "AIzaSyAhOlcSqVZw8hUQ8XGJ9xA8QUNmF0-wMgI",
  authDomain: "olxx-cc881.firebaseapp.com",
  projectId: "olxx-cc881",
  storageBucket: "olxx-cc881.firebasestorage.app",
  messagingSenderId: "723991977197",
  appId: "1:723991977197:web:a1312e7b57ebec9a9d40e4",
  measurementId: "G-RLZYRDKPGG"
};

let db;

try {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  
  db = firebase.firestore();
  console.log('✅ Firebase Firestore (Client SDK) connected successfully!');
} catch (err) {
  console.error('❌ Firebase connection failed:', err.message);
}

module.exports = db;

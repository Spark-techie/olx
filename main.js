const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
require('dotenv').config();

let db;

try {
  if (!getApps().length) {
    const serviceAccount = {
      type: 'service_account',
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
    };

    initializeApp({ credential: cert(serviceAccount) });
  }

  db = getFirestore();
  db.settings({ ignoreUndefinedProperties: true });
  console.log('✅ Firebase Firestore connected successfully!');
} catch (err) {
  console.error('❌ Firebase connection failed:', err.message);
  console.log('Make sure your Firebase credentials are set in .env');
}

module.exports = db;

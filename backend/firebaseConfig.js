// firebaseConfig.js
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // حمّل هيدا الملف من Firebase Console > Project Settings > Service accounts

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://royalpaws-hub-default-rtdb.firebaseio.com"
});

const db = admin.database();
module.exports = db;
